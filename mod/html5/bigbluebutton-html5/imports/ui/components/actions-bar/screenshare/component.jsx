import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import Styled from './styles';
import ScreenshareBridgeService from '/imports/api/screenshare/client/bridge/service';
import {
  shareScreen,
  screenshareHasEnded,
} from '/imports/ui/components/screenshare/service';
import { SCREENSHARING_ERRORS } from '/imports/api/screenshare/client/bridge/errors';
import Button from '/imports/ui/components/common/button/component';

const { isMobile } = deviceInfo;
const { isSafari, isTabletApp } = browserInfo;

const propTypes = {
  intl: PropTypes.objectOf(Object).isRequired,
  enabled: PropTypes.bool.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  isVideoBroadcasting: PropTypes.bool.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
  screenshareDataSavingSetting: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  desktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.desktopShareLabel',
    description: 'Desktop Share option label',
  },
  stopDesktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareLabel',
    description: 'Stop Desktop Share option label',
  },
  desktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.desktopShareDesc',
    description: 'adds context to desktop share option',
  },
  stopDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareDesc',
    description: 'adds context to stop desktop share option',
  },
  screenShareNotSupported: {
    id: 'app.media.screenshare.notSupported',
    descriptions: 'error message when trying share screen on unsupported browsers',
  },
  screenShareUnavailable: {
    id: 'app.media.screenshare.unavailable',
    descriptions: 'title for unavailable screen share modal',
  },
  finalError: {
    id: 'app.screenshare.screenshareFinalError',
    description: 'Screen sharing failures with no recovery procedure',
  },
  retryError: {
    id: 'app.screenshare.screenshareRetryError',
    description: 'Screen sharing failures where a retry is recommended',
  },
  retryOtherEnvError: {
    id: 'app.screenshare.screenshareRetryOtherEnvError',
    description: 'Screen sharing failures where a retry in another environment is recommended',
  },
  unsupportedEnvError: {
    id: 'app.screenshare.screenshareUnsupportedEnv',
    description: 'Screen sharing is not supported, changing browser or device is recommended',
  },
  permissionError: {
    id: 'app.screenshare.screensharePermissionError',
    description: 'Screen sharing failure due to lack of permission',
  },
});

const getErrorLocale = (errorCode) => {
  switch (errorCode) {
    // Denied getDisplayMedia permission error
    case SCREENSHARING_ERRORS.NotAllowedError.errorCode:
      return intlMessages.permissionError;
    // Browser is supposed to be supported, but a browser-related error happening.
    // Suggest retrying in another device/browser/env
    case SCREENSHARING_ERRORS.AbortError.errorCode:
    case SCREENSHARING_ERRORS.InvalidStateError.errorCode:
    case SCREENSHARING_ERRORS.OverconstrainedError.errorCode:
    case SCREENSHARING_ERRORS.TypeError.errorCode:
    case SCREENSHARING_ERRORS.NotFoundError.errorCode:
    case SCREENSHARING_ERRORS.NotReadableError.errorCode:
    case SCREENSHARING_ERRORS.PEER_NEGOTIATION_FAILED.errorCode:
    case SCREENSHARING_ERRORS.SCREENSHARE_PLAY_FAILED.errorCode:
    case SCREENSHARING_ERRORS.MEDIA_NO_AVAILABLE_CODEC.errorCode:
    case SCREENSHARING_ERRORS.MEDIA_INVALID_SDP.errorCode:
      return intlMessages.retryOtherEnvError;
    // Fatal errors where a retry isn't warranted. This probably means the server
    // is misconfigured somehow or the provider is utterly botched, so nothing
    // the end user can do besides requesting support
    case SCREENSHARING_ERRORS.SIGNALLING_TRANSPORT_CONNECTION_FAILED.errorCode:
    case SCREENSHARING_ERRORS.MEDIA_SERVER_CONNECTION_ERROR.errorCode:
    case SCREENSHARING_ERRORS.SFU_INVALID_REQUEST.errorCode:
      return intlMessages.finalError;
    // Unsupported errors
    case SCREENSHARING_ERRORS.NotSupportedError.errorCode:
      return intlMessages.unsupportedEnvError;
    // Errors that should be silent/ignored. They WILL NOT be LOGGED nor NOTIFIED via toasts.
    case SCREENSHARING_ERRORS.ENDED_WHILE_STARTING.errorCode:
      return null;
    // Fall through: everything else is an error which might be solved with a retry
    default:
      return intlMessages.retryError;
  }
};

const ScreenshareButton = ({
  intl,
  enabled,
  isVideoBroadcasting,
  amIPresenter,
  isMeteorConnected,
  screenshareDataSavingSetting,
  mountModal,
}) => {
  // This is the failure callback that will be passed to the /api/screenshare/kurento.js
  // script on the presenter's call
  const handleFailure = (error) => {
    const {
      errorCode = SCREENSHARING_ERRORS.UNKNOWN_ERROR.errorCode,
      errorMessage,
    } = error;

    const localizedError = getErrorLocale(errorCode);

    if (localizedError) {
      notify(intl.formatMessage(localizedError, { 0: errorCode }), 'error', 'desktop');
      logger.error({
        logCode: 'screenshare_failed',
        extraInfo: { errorCode, errorMessage },
      }, `Screenshare failed: ${errorMessage} (code=${errorCode})`);
    }

    screenshareHasEnded();
  };

  const renderScreenshareUnavailableModal = () => mountModal(
    <Styled.ScreenShareModal
      onRequestClose={() => mountModal(null)}
      hideBorder
      contentLabel={intl.formatMessage(intlMessages.screenShareUnavailable)}
    >
      <Styled.Title>
        {intl.formatMessage(intlMessages.screenShareUnavailable)}
      </Styled.Title>
      <p>{intl.formatMessage(intlMessages.screenShareNotSupported)}</p>
    </Styled.ScreenShareModal>,
  );

  const screenshareLabel = intlMessages.desktopShareLabel;

  const vLabel = isVideoBroadcasting
    ? intlMessages.stopDesktopShareLabel : screenshareLabel;

  const vDescr = isVideoBroadcasting
    ? intlMessages.stopDesktopShareDesc : intlMessages.desktopShareDesc;

  const shouldAllowScreensharing = enabled
    && ( !isMobile || isTabletApp)
    && amIPresenter;

  const dataTest = isVideoBroadcasting ? 'stopScreenShare' : 'startScreenShare';

  const shareScreenIcon = !isVideoBroadcasting ? 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g data-name="Layer 2">
    <path fill="#fff"
      d="M66.46,28.18l-7.09-3.77a2,2,0,0,0-2.94,1.84l0,1a34.55,34.55,0,0,0-29,34.18,3,3,0,1,0,6,0A28.57,28.57,0,0,1,56.68,33.33h0l0,.94a2,2,0,0,0,3.06,1.63l6.81-4.26A2,2,0,0,0,66.46,28.18Z" />
    <path fill="#fff"
      d="M86,12.25H14c-5,0-9,4.52-9,10V65c0,5.51,4.07,10,9,10H47v6.73H32.46a3,3,0,0,0,0,6H67.54a3,3,0,1,0,0-6H53V75H86c5,0,9-4.52,9-10V22.28C95,16.77,90.93,12.25,86,12.25ZM89,65c0,2.14-1.42,4-3,4H14c-1.62,0-3-1.89-3-4V22.28c0-2.15,1.42-4,3-4H86c1.62,0,3,1.88,3,4Z" />
  </g>
</svg> : 
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g data-name="Layer 2">
    <path fill="#fff"
      d="M51.67,38.72a27.76,27.76,0,0,1,5-1.44l0,.94a2,2,0,0,0,3.06,1.63l6.81-4.26a2,2,0,0,0-.12-3.46l-7.09-3.77a2,2,0,0,0-2.94,1.83l0,1a34.83,34.83,0,0,0-8.85,2.69Z" />
    <path fill="#fff"
      d="M86,16.2H32.67l5.07,6H86c1.62,0,3,1.88,3,4v42.7c0,2.15-1.42,4-3,4h-5.4l5.06,6H86c5,0,9-4.51,9-10V26.23C95,20.71,90.93,16.2,86,16.2Z" />
    <path fill="#fff"
      d="M21,9.36a2.9,2.9,0,0,0-1.7-1A3,3,0,0,0,16.73,9a3,3,0,0,0-.36,4.23l2.5,3H14c-5,0-9,4.51-9,10v42.7c0,5.52,4.07,10,9,10H47v6.73H32.46a3,3,0,0,0,0,6H67.54a3,3,0,1,0,0-6H53V79H71.82l9.79,11.61a3,3,0,0,0,2.3,1.07,3,3,0,0,0,1.93-.71,2.9,2.9,0,0,0,.9-1.33,3,3,0,0,0-.54-2.89ZM14,73c-1.62,0-3-1.88-3-4V26.23c0-2.15,1.42-4,3-4h9.89L38.77,39.78A34.59,34.59,0,0,0,27.48,65.41a3,3,0,1,0,6,0,28.62,28.62,0,0,1,9.16-21L66.76,73Z" />
  </g>
</svg>;

  return shouldAllowScreensharing
    ? (
      <Button
        disabled={(!isMeteorConnected && !isVideoBroadcasting)}
        // icon={isVideoBroadcasting ? 'desktop' : 'desktop_off'}
        customIcon={shareScreenIcon}
        data-test={dataTest}
        label={intl.formatMessage(vLabel)}
        description={intl.formatMessage(vDescr)}
        color={isVideoBroadcasting ? 'primary' : 'default'}
        ghost={!isVideoBroadcasting}
        hideLabel
        circle
        size="lg"
        onClick={isVideoBroadcasting
          ? screenshareHasEnded
          : () => {
            if (isSafari && !ScreenshareBridgeService.HAS_DISPLAY_MEDIA) {
              renderScreenshareUnavailableModal();
            } else {
              shareScreen(amIPresenter, handleFailure);
            }
          }}
        id={isVideoBroadcasting ? 'unshare-screen-button' : 'share-screen-button'}
      />
    ) : null;
};

ScreenshareButton.propTypes = propTypes;
export default withModalMounter(injectIntl(memo(ScreenshareButton)));
