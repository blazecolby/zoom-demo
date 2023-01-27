/* globals zoomSdk */
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [runningContext, setRunningContext] = useState(null);
  const [counter, setCounter] = useState(0);
  const [userContextStatus, setUserContextStatus] = useState("");
  const [meetingContext, setMeetingContext] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [meetingStart, setMeetingStart] = useState("");
  const [supportedApis, setSupportedApis] = useState("");

  useEffect(() => {
    async function configureSdk() {
      const configTimer = setTimeout(() => {
        setCounter(counter + 1);
      }, 120 * 60 * 1000);

      try {
        const configResponse = await zoomSdk.config({
          capabilities: [
            "onMeeting",
            "connect",
            "onConnect",
            "authorize",
            "onAuthorized",
            "promptAuthorize",
            "getUserContext",
            "onMyUserContextChange",
            "allowParticipantToRecord",
            "expandApp",
            "participantUUIDs",
            "getMeetingContext",
            "getMeetingJoinUrl",
            "getMeetingParticipants",
            "getMeetingUUID",
            "getRecordingContext",
            "getRunningContext",
            "openUrl",
            "showNotification",
          ],
          version: "0.16.0",
        });

        setRunningContext(configResponse.runningContext);
        setUserContextStatus(configResponse.auth.status);
        setMeetingContext(configResponse);
        console.log("configResponse: ", configResponse);
      } catch (error) {
        setError(error);
      } finally {
        clearTimeout(configTimer);
      }
    }
    configureSdk();
  }, [counter]);

  useEffect(() => {
    try {
      const supportedApis = zoomSdk.getSupportedJsApis().then((res) => {
        setSupportedApis(res.supportedApis);
      });
    } catch (error) {
      setError(error);
    }
  }, [runningContext]);

  useEffect(() => {
    if (user) {
      zoomSdk.getMeetingContext().then((res) => {
        console.log("getMeetingContext: ", res);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user)
      zoomSdk.addEventListener("onMeeting", (event) => {
        console.log("onMeeting: ", event);
      });
  }, [runningContext]);

  return (
    <div className="App">
      {alert("runningContext: " + runningContext)}
      <h1>
        Welcome
        {user ? ` ${user.first_name} ${user.last_name}` : ""}!
      </h1>
      <p style={{ fontSize: "13px" }}>{user ? `User Id: ${user.id}` : ""}</p>
      <p style={{ fontSize: "13px" }}>
        {user ? `User Email: ${user.email}` : ""}
      </p>
      <p style={{ fontSize: "13px" }}>
        {user ? `User Status: ${user.status}` : ""}
      </p>
      <p style={{ fontSize: "13px" }}>
        {runningContext ? `Running Context: ${runningContext}` : ""}
      </p>
      {/* Meeting info */}
      <p style={{ fontSize: "13px" }}>
        {meetingId ? `Meeting Id: ${meetingId}` : ""}
      </p>
      <p style={{ fontSize: "13px" }}>
        {meetingStart ? `Meeting Start: ${meetingStart}` : ""}
      </p>

      <Authorization
        handleError={setError}
        handleUserContextStatus={setUserContextStatus}
        handleUser={setUser}
        user={user}
        userContextStatus={userContextStatus}
      />
    </div>
  );
}

export default App;

export const Authorization = (props) => {
  const { handleUser, handleUserContextStatus, userContextStatus } = props;

  useEffect(() => {
    zoomSdk.addEventListener("onMyUserContextChange", (event) => {
      handleUserContextStatus(event.status);
    });
    async function fetchUser() {
      try {
        const response = await fetch("/zoom/api/v2/users/me");
        if (response.status !== 200) throw new Error();
        const user = await response.json();
        handleUser(user);
      } catch (error) {
        console.error(error);
      }
    }

    if (userContextStatus === "authorized") {
      fetchUser();
    } else {
      console.log("User is not authorized");
    }
  }, [handleUser, handleUserContextStatus, userContextStatus]);

  return <></>;
};
