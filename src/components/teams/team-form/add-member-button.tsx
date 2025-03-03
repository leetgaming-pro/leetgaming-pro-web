import { Avatar, Button, Input } from "@nextui-org/react";
import React from "react";
import axios from "axios";

interface Member {
  id: string;
  name: string;
}

const AddMemberForm: React.FC = () => {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [newMember, setNewMember] = React.useState<string>("");
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([]);

  const addMember = () => {
    const selectedMember = filteredMembers.find(
      (member) => member.name === newMember
    );
    if (selectedMember) {
      setMembers([...members, selectedMember]);
      setNewMember("");
      setFilteredMembers([]);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMember(value);

    if (value.trim() !== "") {
      try {
        const response = await axios.post("/api/search-members", { query: value });
        setFilteredMembers(response.data);
      } catch (error) {
        console.error("Error searching members:", error);
      }
    } else {
      setFilteredMembers([]);
    }
  };

  const handleSelectMember = (member: Member) => {
    setNewMember(member.name);
    setFilteredMembers([]);
    setMembers((prevMembers) => [...prevMembers, member]);
    setNewMember("");
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2">
            <Avatar alt={member.name.charAt(0).toUpperCase()} />
            <span>{member.name}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <Input
          value={newMember}
          onChange={handleInputChange}
          placeholder="Enter member name"
        />
        {filteredMembers.length > 0 && (
          <div className="dropdown">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="dropdown-item"
                onClick={() => handleSelectMember(member)}
              >
                {member.name}
              </div>
            ))}
          </div>
        )}
        <Button onPress={addMember} color="primary" variant="ghost">
          Add Member
        </Button>
      </div>
    </>
  );
};

export default AddMemberForm;