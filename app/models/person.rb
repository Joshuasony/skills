# == Schema Information
#
# Table name: people
#
#  id                      :integer          not null, primary key
#  birthdate               :datetime
#  location                :string
#  marital_status          :string
#  updated_by              :string
#  name                    :string
#  title                   :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  picture                 :string
#  competences             :string
#  company_id              :bigint(8)
#  associations_updatet_at :datetime
#  nationality             :string
#  nationality2            :string
#

class Person < ApplicationRecord
  include PgSearch

  belongs_to :company

  mount_uploader :picture, PictureUploader
  has_many :person_competences, dependent: :destroy
  has_many :projects, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :advanced_trainings, dependent: :destroy
  has_many :educations, dependent: :destroy
  has_many :expertise_topic_skill_values, dependent: :destroy
  has_many :expertise_topics, through: :expertise_topic_skill_values
  has_and_belongs_to_many :roles
  has_many :language_skills, dependent: :delete_all

  validates :birthdate, :location, :name, :nationality,
            :roles, :title, :marital_status, presence: true
  validates :location, :name,
            :title, length: { maximum: 100 }

  validates :nationality,
            inclusion: { in: ISO3166::Country.all.collect(&:alpha2) }
  validates :nationality2,
            inclusion: { in: ISO3166::Country.all.collect(&:alpha2) },
            allow_blank: true

  validate :picture_size

  scope :list, -> { order(:name) }

  enum marital_status: %i[single married widowed registered_partnership divorced]

  pg_search_scope :search,
                  against: [
                    :name,
                    :title,
                    :competences
                  ],
                  associated_against: {
                    projects: [:description, :title, :role, :technology],
                    activities: [:description, :role],
                    educations: [:location, :title],
                    advanced_trainings: :description,
                    expertise_topics: :name
                  },
                  using: {
                    tsearch: {
                      prefix: true
                    }
                  }

  private

  def picture_size
    return if picture.nil? || picture.size < 10.megabytes
    errors.add(:picture, 'grösse kann maximal 10MB sein')
  end

end
