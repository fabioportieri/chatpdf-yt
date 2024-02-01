import { useCallback, useEffect, useRef, useState } from "react";

export type IframeCommunicationType = {
  error: string | null;
  success: boolean;
  loading: boolean;
};
// Custom hook to handle iframe communication and authentication
const useIframeCommunication = (parentSiteUrl: string) => {
  const timerId = useRef<NodeJS.Timeout>();

  const [hashedSecret, setHashedSecret] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authResult, setAuthResult] = useState<{
    error: string | null;
    success: boolean;
    loading: boolean;
  }>({
    error: "",
    success: false,
    loading: true,
  });

  useEffect(() => {
    const handleReceivedMessage = (event: MessageEvent) => {
      console.log(
        "Event arrived from iframe:",
        event,
        event.origin,
        parentSiteUrl
      );

      if (event.origin !== parentSiteUrl) {
        return;
      }

      if (
        event.source &&
        event.source instanceof Window &&
        event.source.location.href !== parentSiteUrl
      ) {
        console.warn(
          " Parent site url is not the one expected. rejected message. (url provided: ",
          event.source.location.href,
          ", url configured:",
          parentSiteUrl,
          " )"
        );
        return;
      }

      // Handle the received message as needed
      const data = event.data;
      console.log(
        "Origin is correct, Received message from parent:",
        data,
        data?.hashedSecret,
        data?.userId
      );

      // Check if the message contains the hashed secret
      if (data.hashedSecret) {
        setHashedSecret(data.hashedSecret);
      }
      // Check if the message contains the user id
      if (data.userId) {
        setUserId(data.userId);
      }
    };

    // Add event listener for messages from the parent site
    window.addEventListener("message", handleReceivedMessage);
    console.log("window:message event listener attached");

    return () => {
      // Clean up the event listener when the component unmounts
      window.removeEventListener("message", handleReceivedMessage);
    };
  }, [parentSiteUrl]);

  const clearAuthenticationTimeout = () => {
    if (timerId.current) {
      console.log("clearing authentication timeout");
      clearTimeout(timerId.current);
    }
  };

  const handleAuthenticationMock = useCallback(async () => {
    const hashedSecret =
      "$2a$10$OXUXS5jAnkR/3PPpGweiaOwxQEcGqHuClP/xGiHhIsgFiijReJzxC";
    const userId = "78b168fd-16ab-4e17-b5b3-ce412a582316";
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hashedSecret, userId }),
      });

      if (response.ok) {
        const success = await response.json();
        console.log("Received data from /api/auth:", success);
        let error = "";
        if (!success) {
          error = "Invalid password provided";
        } else {
          clearAuthenticationTimeout();
        }
        setAuthResult({ error, success, loading: false });
      } else {
        const errorText = `Error fetching data from /api/auth: ${response.status} ${response.statusText}`;
        console.error(errorText);
        setAuthResult({ error: errorText, success: false, loading: false });
      }
    } catch (error) {
      const errorText = `Error fetching data from /api/auth: ${
        (error as Error).message
      }`;
      console.error(errorText);
      setAuthResult({ error: errorText, success: false, loading: false });
    }
  }, [hashedSecret, userId]);

  // Function to handle authentication when hashedSecret is available
  const handleAuthentication = useCallback(async () => {
    if (hashedSecret && userId) {
      console.log(
        "hashed secret and userId are being passed from parent app..validating"
      );

      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hashedSecret, userId }),
        });

        if (response.ok) {
          const success = await response.json();
          console.log("Received data from /api/auth:", success);
          let error = "";
          if (!success) {
            error = "Invalid password provided";
          } else {
            clearAuthenticationTimeout();
          }
          setAuthResult({ error, success, loading: false });
        } else {
          const errorText = `Error fetching data from /api/auth: ${response.status} ${response.statusText}`;
          console.error(errorText);
          setAuthResult({ error: errorText, success: false, loading: false });
        }
      } catch (error) {
        const errorText = `Error fetching data from /api/auth: ${
          (error as Error).message
        }`;
        console.error(errorText);
        setAuthResult({ error: errorText, success: false, loading: false });
      }
    }
  }, [hashedSecret, userId]);

  // Call the authentication function when hashedSecret changes
  useEffect(() => {
    // console.log("setting authentication timeout");
    timerId.current = setTimeout(() => {
      setAuthResult({
        error: "Authentication timeout",
        success: false,
        loading: false,
      });
    }, 2000);
    // TODO REMOVE Mock
    handleAuthentication();
    // handleAuthenticationMock();

    return () => {
      // Clear the timer when the component unmounts or when hashedSecret changes
      clearAuthenticationTimeout();
    };
    // TODO REMOVE Mock
  }, [handleAuthentication]);

  return authResult;
};

export default useIframeCommunication;
