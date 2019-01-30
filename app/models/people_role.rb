class PeopleRole < ApplicationRecord
  belongs_to :person
  belongs_to :role

  validates :person_id, :role_id, :level, :percent, presence: true
  validates :percent, inclusion: 0..200

  scope :list, -> {}
end
