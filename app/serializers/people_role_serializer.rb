class PeopleRoleSerializer < ApplicationSerializer
  attributes :id, :person_id, :role_id, :level, :percent

  belongs_to :person, serializer: PersonUpdatedAtSerializer
  belongs_to :role, serializer: RoleSerializer
end
