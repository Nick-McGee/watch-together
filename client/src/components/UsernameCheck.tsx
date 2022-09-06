import { useRef } from "react";

import Modal from "../ui/Modal";

import { useRoom } from "../contexts/RoomContext";

const UsernameCheck = ({ roomId }: { roomId: string }): JSX.Element => {
  const { users, setUsers } = useRoom();
  const usernameInputRef = useRef<HTMLInputElement | null>(null);

  const setUsersHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Check username
    setUsers(usernameInputRef.current!.value);
    usernameInputRef.current!.value = "";
  };

  const missingUsernameModal = (
    <Modal>
      <div>
        <p>Missing username</p>
        <form onSubmit={setUsersHandler}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            name="username"
            id="username"
            ref={usernameInputRef}
          />
          <button type="submit">Set Username</button>
        </form>
      </div>
    </Modal>
  );

  return users[roomId] === undefined ? (
    missingUsernameModal
  ) : (
    <p>{users[roomId].name}</p>
  );
};

export default UsernameCheck;
