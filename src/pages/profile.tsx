import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const Profile = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1 className="text-3x1 font-semibold tracking-wide mt-6">Profile</h1>
          <h1 className="font-medium text-gray-500 my-2">
            Username: {user?.username}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Email: {user?.attributes?.email}
          </p>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
  );
};

export default Profile;
