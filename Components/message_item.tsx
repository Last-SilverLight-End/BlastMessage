import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import { InMessage } from '@/models/message/in_message';

interface Props {
  uid: string;
  displayName: string;
  owner: boolean;
  item: InMessage;
}

const MessageItem = function ({ item }: Props) {
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex pl="2" pt="2" alignItems="center">
          <Avatar
            size="xs"
            src={item.author ? item.author.photoURL ?? 'https://bit.ly/broken-link' : 'https://bit.ly/broken-link'}
          />
          <Text fontSize="xx-small" m="1">
            {item.author ? item.author.displayName : 'IsNoOne'}
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.300" m="1">
            1일
          </Text>
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" padding="2">
          <Text whiteSpace="pre-line" fontSize="sm">
            {item.message}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageItem;
