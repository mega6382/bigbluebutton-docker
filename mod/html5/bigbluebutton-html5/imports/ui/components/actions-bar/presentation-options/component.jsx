import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  setPresentationIsOpen: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  minimizePresentationLabel: {
    id: 'app.actionsBar.actionsDropdown.minimizePresentationLabel',
    description: '',
  },
  minimizePresentationDesc: {
    id: 'app.actionsBar.actionsDropdown.restorePresentationDesc',
    description: '',
  },
  restorePresentationLabel: {
    id: 'app.actionsBar.actionsDropdown.restorePresentationLabel',
    description: 'Restore Presentation option label',
  },
  restorePresentationDesc: {
    id: 'app.actionsBar.actionsDropdown.restorePresentationDesc',
    description: 'button to restore presentation after it has been closed',
  },
});

const PresentationOptionsContainer = ({
  intl,
  presentationIsOpen,
  setPresentationIsOpen,
  layoutContextDispatch,
  hasPresentation,
  hasExternalVideo,
  hasScreenshare,
  hasPinnedSharedNotes,
}) => {
  let buttonType = 'presentation';
  if (hasExternalVideo) {
    // hack until we have an external-video icon
    buttonType = 'external-video';
  } else if (hasScreenshare) {
    buttonType = 'desktop';
  }

  const isThereCurrentPresentation = hasExternalVideo || hasScreenshare || hasPresentation || hasPinnedSharedNotes;

  const presentationIcon = !presentationIsOpen ? 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 23">
    <g>
      <path fill="#fff" d="M23,4.314c0.55,0,1-0.45,1-1v-1c0-0.55-0.45-1-1-1H4.828l3,3H22H23z" />
      <path fill="#fff" d="M2.171,4.314L0.029,2.172C0.021,2.22,0,2.263,0,2.314v1c0,0.55,0.45,1,1,1h1H2.171z" />
      <path fill="#fff" d="M20.829,17.314H21c0.55,0,1-0.45,1-1v-11H8.828L20.829,17.314z" />
      <path fill="#fff"
        d="M2,16.314c0,0.55,0.45,1,1,1h5.586l-3.293,3.293c-0.391,0.391-0.391,1.023,0,1.414c0.391,0.391,1.023,0.391,1.414,0   L11,17.728v3.586c0,0.552,0.447,1,1,1c0.553,0,1-0.448,1-1v-3.586l4.293,4.293c0.195,0.195,0.451,0.293,0.707,0.293   c0.256,0,0.512-0.098,0.707-0.293c0.252-0.251,0.322-0.599,0.252-0.921l-3.787-3.786l-12.001-12H2V16.314z" />
      <polygon fill="#f00" points="2.102,0 0.685,1.414 3.585,4.314 4.585,5.314 21.9,22.627 23.314,21.213 7.415,5.314 6.415,4.314  " />
    </g>
  </svg> : 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 23">
    <g>
      <path fill="#fff" d="M22,3h1c0.55,0,1-0.45,1-1V1c0-0.55-0.45-1-1-1H1C0.45,0,0,0.45,0,1v1c0,0.55,0.45,1,1,1h1H22z" />
      <path fill="#fff" d="M2,15c0,0.55,0.45,1,1,1h5.586l-3.293,3.293c-0.391,0.391-0.391,1.023,0,1.414c0.391,0.391,1.023,0.391,1.414,0L11,16.414   V20c0,0.552,0.447,1,1,1c0.553,0,1-0.448,1-1v-3.586l4.293,4.293C17.488,20.902,17.744,21,18,21c0.256,0,0.512-0.098,0.707-0.293   c0.391-0.391,0.391-1.023,0-1.414L15.414,16H21c0.55,0,1-0.45,1-1V4H2V15z" />
    </g>
  </svg>;
  return (
    <Button
      // icon={`${buttonType}${!presentationIsOpen ? '_off' : ''}`}
      customIcon={presentationIcon}
      label={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationLabel : intlMessages.minimizePresentationLabel)}
      aria-label={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationLabel : intlMessages.minimizePresentationLabel)}
      aria-describedby={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationDesc : intlMessages.minimizePresentationDesc)}
      description={intl.formatMessage(!presentationIsOpen ? intlMessages.restorePresentationDesc : intlMessages.minimizePresentationDesc)}
      color={presentationIsOpen ? "primary" : "default"}
      hideLabel
      circle
      size="lg"
      onClick={() => setPresentationIsOpen(layoutContextDispatch, !presentationIsOpen)}
      id="restore-presentation"
      ghost={!presentationIsOpen}
      disabled={!isThereCurrentPresentation}
      data-test={!presentationIsOpen ? 'restorePresentation' : 'minimizePresentation'}
    />
  );
};

PresentationOptionsContainer.propTypes = propTypes;
export default injectIntl(PresentationOptionsContainer);
