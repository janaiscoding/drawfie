export const Users = ({
  users,
}: {
  users: { id: string; name: string; isReady: boolean; points: number }[] | null;
}) => {
  return (
    <div>
      <h1 className="text-3xl">Players</h1>
      {users &&
        users.map((user) => (
          <div className="flex gap-2" key={user.id}>
            <p className="bg-cyan-700 text-cyan-100 p-2 rounded-full "> {user.id.substring(0, 1)} </p>
            <p className={user.isReady ? "text-green-500" : "text-red-200"}>{user.isReady ? "READY" : "Not ready"}</p>
          </div>
        ))}
    </div>
  );
};
