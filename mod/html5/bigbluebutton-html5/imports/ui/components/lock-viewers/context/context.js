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
      lockOnJoinConfigurable: true,
      hideViewersCursor: false,
    },
    userLocks: {
      userWebcam: true,
      userMic: true,
      userNotes: true,
      userPrivateChat: true,
      userPublicChat: true,
    },
  });
}

const lockContext = React.createContext(new LockStruct());

export default lockContext;
