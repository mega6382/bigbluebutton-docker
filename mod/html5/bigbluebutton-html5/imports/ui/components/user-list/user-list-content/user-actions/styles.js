import styled from 'styled-components';

import Styled from '/imports/ui/components/user-list/styles';
import StyledContent from '/imports/ui/components/user-list/user-list-content/styles';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmall,
  fontSizeSmaller,
  fontSizeXS,
} from '/imports/ui/stylesheets/styled-components/typography';

const UnreadMessages = styled(StyledContent.UnreadMessages)``;

const UnreadMessagesText = styled(StyledContent.UnreadMessagesText)``;

const ListItem = styled(StyledContent.ListItem)`
  ${({ $disabled }) => $disabled && `
    cursor: not-allowed;
    border: none;
  `}
`;

const ActionsTitle = styled.div`
  font-weight: 400;
  font-size: ${fontSizeSmall};
`;

const ActionsLock = styled.div`
  font-weight: 200;
  font-size: ${fontSizeSmaller};
  color: ${colorGray};

  > i {
    font-size: ${fontSizeXS};
  }
`;

const Messages = styled(Styled.Messages)``;

const UserActions = styled(Styled.UserActions)``;

const Container = styled(StyledContent.Container)``;

const SmallTitle = styled(Styled.SmallTitle)``;

const ScrollableList = styled(StyledContent.ScrollableList)``;

const List = styled(StyledContent.List)``;

export default {
  UnreadMessages,
  UnreadMessagesText,
  ListItem,
  ActionsTitle,
  ActionsLock,
  Messages,
  UserActions,
  Container,
  SmallTitle,
  ScrollableList,
  List,
};
