import React from 'react';

export function LockStruct() {
  return ({
    isLocked: true,
    lockSettings: {
      disableCam: true,
      disableMic: true,
      disableNotes: true,
      disablePrivateChat: true,
      disablePublicChat: true,
      lockOnJoin: true,
      lockOnJoinConfigurable: false,
      hideViewersCursor: false,
    },
    userLocks: {
      userWebcam: false,
      userMic: false,
      userNotes: false,
      userPrivateChat: false,
      userPublicChat: false,
    },
  });
}

const lockContext = React.createContext(new LockStruct());

export default lockContext;
