import React, { memo } from 'react';
import PropTypes from 'prop-types';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import VideoService from '../service';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { validIOSVersion } from '/imports/ui/components/app/service';
import deviceInfo from '/imports/utils/deviceInfo';
import { debounce } from 'lodash';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { isVirtualBackgroundsEnabled } from '/imports/ui/services/features';
import Button from '/imports/ui/components/common/button/component';

const ENABLE_WEBCAM_SELECTOR_BUTTON = Meteor.settings.public.app.enableWebcamSelectorButton;
const ENABLE_CAMERA_BRIGHTNESS = Meteor.settings.public.app.enableCameraBrightness;

const intlMessages = defineMessages({
  videoSettings: {
    id: 'app.video.videoSettings',
    description: 'Open video settings',
  },
  visualEffects: {
    id: 'app.video.visualEffects',
    description: 'Visual effects label',
  },
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  advancedVideo: {
    id: 'app.video.advancedVideo',
    description: 'Open advanced video label',
  },
  videoLocked: {
    id: 'app.video.videoLocked',
    description: 'video disabled label',
  },
  videoConnecting: {
    id: 'app.video.connecting',
    description: 'video connecting label',
  },
  camCapReached: {
    id: 'app.video.meetingCamCapReached',
    description: 'meeting camera cap label',
  },
  meteorDisconnected: {
    id: 'app.video.clientDisconnected',
    description: 'Meteor disconnected label',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
});

const JOIN_VIDEO_DELAY_MILLISECONDS = 500;

const propTypes = {
  intl: PropTypes.object.isRequired,
  hasVideoStream: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  mountVideoPreview: PropTypes.func.isRequired,
};

const JoinVideoButton = ({
  intl,
  hasVideoStream,
  status,
  disableReason,
  mountVideoPreview,
}) => {
  const { isMobile } = deviceInfo;
  const isMobileSharingCamera = hasVideoStream && isMobile;
  const isDesktopSharingCamera = hasVideoStream && !isMobile;
  const shouldEnableWebcamSelectorButton = ENABLE_WEBCAM_SELECTOR_BUTTON
    && isDesktopSharingCamera;
  const shouldEnableWebcamVisualEffectsButton =
    (isVirtualBackgroundsEnabled() || ENABLE_CAMERA_BRIGHTNESS)
    && hasVideoStream
    && !isMobile;
  const exitVideo = () => isDesktopSharingCamera && (!VideoService.isMultipleCamerasEnabled()
    || shouldEnableWebcamSelectorButton);

  const handleOnClick = debounce(() => {
    if (!validIOSVersion()) {
      return VideoService.notify(intl.formatMessage(intlMessages.iOSWarning));
    }

    switch (status) {
      case 'videoConnecting':
        VideoService.stopVideo();
        break;
      case 'connected':
      default:
        if (exitVideo()) {
          VideoService.exitVideo();
        } else {
          mountVideoPreview(isMobileSharingCamera);
        }
    }
  }, JOIN_VIDEO_DELAY_MILLISECONDS);

  const handleOpenAdvancedOptions = (props) => {
    mountVideoPreview(isDesktopSharingCamera, props);
  };

  const getMessageFromStatus = () => {
    let statusMessage = status;
    if (status !== 'videoConnecting') {
      statusMessage = exitVideo() ? 'leaveVideo' : 'joinVideo';
    }
    return statusMessage;
  };

  const label = disableReason
    ? intl.formatMessage(intlMessages[disableReason])
    : intl.formatMessage(intlMessages[getMessageFromStatus()]);

  const isSharing = hasVideoStream || status === 'videoConnecting';

  const renderUserActions = () => {
    const actions = [];

    if (shouldEnableWebcamSelectorButton) {
      actions.push(
        {
          key: 'advancedVideo',
          label: intl.formatMessage(intlMessages.advancedVideo),
          onClick: () => handleOpenAdvancedOptions(),
        },
      );
    }

    if (shouldEnableWebcamVisualEffectsButton) {
      actions.push(
        {
          key: 'virtualBgSelection',
          label: intl.formatMessage(intlMessages.visualEffects),
          onClick: () => handleOpenAdvancedOptions({ isVisualEffects: true }),
        },
      );
    }

    if (actions.length === 0) return null;
    const customStyles = { top: '-3.6rem' };

    return (
      <BBBMenu
        customStyles={!isMobile ? customStyles : null}
        trigger={(
          <ButtonEmoji
            emoji="device_list_selector"
            hideLabel
            label={intl.formatMessage(intlMessages.videoSettings)}
            rotate
            tabIndex={0}
          />
        )}
        actions={actions}
        opts={{
          id: "video-dropdown-menu",
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getContentAnchorEl: null,
          fullwidth: "true",
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'top', horizontal: 'center'},
      }}
      />
    );
  }

  const videoIcon = isSharing ? 
  <svg viewBox="2.664 9.799 19.235 10.91" xmlns="http://www.w3.org/2000/svg">
    <path fill="#fff" d="M 20.565 10.54 L 16.696 12.595 L 16.696 11.932 C 16.696 10.753 15.662 9.799 14.389 9.799 L 4.973 9.799 C 3.697 9.799 2.664 10.753 2.664 11.932 L 2.664 18.576 C 2.664 19.755 3.697 20.709 4.973 20.709 L 14.389 20.709 C 15.662 20.709 16.696 19.755 16.696 18.576 L 16.696 17.913 L 20.565 19.968 C 21.297 20.358 21.899 20.038 21.899 19.257 L 21.899 11.255 C 21.899 10.47 21.298 10.15 20.565 10.54 Z" transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)"/>
  </svg>: 
    <svg viewBox="1.7845 7.6592 20.1145 15.4615" xmlns="http://www.w3.org/2000/svg">
    <path fill="#fff" d="M 20.565 10.54 L 16.696 12.595 L 16.696 11.932 C 16.696 10.753 15.662 9.799 14.389 9.799 L 4.973 9.799 C 3.697 9.799 2.664 10.753 2.664 11.932 L 2.664 18.576 C 2.664 19.755 3.697 20.709 4.973 20.709 L 14.389 20.709 C 15.662 20.709 16.696 19.755 16.696 18.576 L 16.696 17.913 L 20.565 19.968 C 21.297 20.358 21.899 20.038 21.899 19.257 L 21.899 11.255 C 21.899 10.47 21.298 10.15 20.565 10.54 Z" transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)"/>
    <path d="M 17.413 21.807 L 13.605 18.096 L 6.069 10.752 L 3.134 7.891 C 2.816 7.582 2.341 7.582 2.023 7.891 C 1.705 8.2 1.705 8.664 2.023 8.974 L 3.848 10.752 C 3.339 10.299 12.775 19.554 12.811 19.488 L 16.302 22.889 C 16.62 23.198 17.095 23.198 17.413 22.889 C 17.73 22.58 17.73 22.116 17.413 21.807 Z" fill="#f00" transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)"/>
  </svg>;

  return (
    <Styled.OffsetBottom>
      <Button
        label={label}
        data-test={hasVideoStream ? 'leaveVideo' : 'joinVideo'}
        onClick={handleOnClick}
        hideLabel
        color={isSharing ? 'primary' : 'default'}
        // icon={isSharing ? 'video' : 'video_off'}
        customIcon={videoIcon}
        ghost={!isSharing}
        size="lg"
        circle
        disabled={!!disableReason}
      />
      {renderUserActions()}
    </Styled.OffsetBottom>
  );
};

JoinVideoButton.propTypes = propTypes;

export default injectIntl(memo(JoinVideoButton));
