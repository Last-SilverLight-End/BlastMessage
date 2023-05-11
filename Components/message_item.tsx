import { Avatar, Box, Flex, Text } from '@chakra-ui/react';

const MessageItem = function () {
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex pl="2" pt="2" alignItems="center">
          <Avatar size="xs" src="https://bit.ly/broken-link" />
          <Text fontSize="xx-small" m="1">
            IsNoOne
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.300" m="1">
            1일
          </Text>
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" padding="2">
          <Text whiteSpace="pre-line" fontSize="sm">
            내용
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageItem;
