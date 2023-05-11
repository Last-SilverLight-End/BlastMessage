import { Avatar, Box, Flex } from '@chakra-ui/react';

const MessageItem = function () {
  return (
    <Box>
      <Box>
        <Flex>
          <Avatar size="xs" src="https://bit.ly/broken-link" />
        </Flex>
        내용
      </Box>
    </Box>
  );
};

export default MessageItem;
