import { Avatar, Box, Button, Divider, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Spacer, Text, Textarea } from '@chakra-ui/react';
import ResizeTextArea from 'react-textarea-autosize';
import { useState } from 'react';
import { InMessage } from '@/models/message/in_message';
import convertDateToString from '@/utils/convert_date_toString';
import MoreBtnIcon from './more_btn_icon';

interface Props {
  uid: string;
  photoURL: string;
  displayName: string;
  owner: boolean;
  item: InMessage;
  onSendComplete: () => void;
}

const MessageItem = function ({ uid, displayName, owner, photoURL, item, onSendComplete }: Props) {
  const haveReply = item.reply !== undefined;
  const [reply, setReply] = useState('');

  async function postReply() {
    const res = await fetch('api/message_add_reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        messageId: item.id,
        reply,
      }),
    });
    console.info('postreply status : ', res.status);

    if (res.status < 300) {
      onSendComplete();
    }
  }
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          <Avatar
            size="xs"
            src={item.author ? item.author.photoURL ?? 'https://bit.ly/broken-link' : 'https://bit.ly/broken-link'}
          />
          <Text fontSize="xx-small" m="1">
            {item.author ? item.author.displayName : 'IsNoOne'}
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.300" m="1">
            {convertDateToString(item.createAt)}
          </Text>
          <Spacer>

          </Spacer>
          {owner && (
            <Menu>
              <MenuButton as={IconButton} icon={<MoreBtnIcon />}
                width="24px" height="24px" borderRadius="full" variant="link" size="xs" />

              <MenuList>
                <MenuItem>비공개 처리</MenuItem>
              </MenuList>
            </Menu>
          )

          }
        </Flex>
      </Box>

      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" padding="2">
          <Text whiteSpace="pre-line" fontSize="sm">
            {item.message}
          </Text>
        </Box>
        {haveReply && (
          <Box pt="2">
            <Divider />
            <Box display="flex" mt="2">
              <Box pt="2">
                <Avatar size="xs" src={photoURL} mr="2" />
              </Box>
              <Box borderRadius="md" p="2" width="full" bg="gray.200">
                <Flex alignItems="center">
                  <Text fontSize="xs">{`${displayName}`}</Text>
                  <Text whiteSpace="pre-line" fontSize="xs" color="gray">
                    {convertDateToString(item.replyAt!)}
                  </Text>
                </Flex>
                <Text whiteSpace="pre-line" fontSize="xs">
                  {item.reply}
                </Text>
              </Box>
            </Box>
          </Box>
        )}
        {haveReply === false && owner && (
          <Box pt="2">
            <Divider />
            <Box display="flex" mt="2">
              <Box pt="2">
                <Avatar size="xs" src={photoURL} mr="2" />
              </Box>
              <Box borderRadius="md" width="full" bg="gray.200" mr="2">
                <Textarea
                  border="none"
                  boxShadow="none !important"
                  resize="none"
                  minH="unset"
                  overflow="hidden"
                  fontSize="xs"
                  as={ResizeTextArea}
                  placeholder="댓글을 입력 하세요"
                  value={reply}
                  onChange={(e) => {
                    setReply(e.currentTarget.value);
                  }}
                />
              </Box>
              <Button
                isDisabled={reply.length === 0 || reply === ''}
                colorScheme="pink"
                bgColor="#006800"
                variant="solid"
                size="sm"
                onClick={() => {
                  console.log(`reply is : ${reply}`);
                  console.log(reply.length);
                  postReply();
                }}
              >
                등록
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageItem;
