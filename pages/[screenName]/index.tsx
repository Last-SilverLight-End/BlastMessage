import { GetServerSideProps, NextPage } from 'next';
import { Avatar, Box, Text, Flex, Textarea, Button, useToast, FormControl, Switch, FormLabel } from '@chakra-ui/react';
import FlexiableTextArea from 'react-textarea-autosize';
import { SetStateAction, useState } from 'react';
import { async } from '@firebase/util';
import axios, { AxiosResponse } from 'axios';
import { ServiceLayout } from '@/Components/ServiceLayout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';

interface UserProps {
  userInfo: InAuthUser | null | undefined;
  userMessage: string | null;
}

async function postMessage({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  if (message.length <= 0) {
    return {
      result: false,
      message: '메세지가 없습니다. 입력해주세요',
    };
  }
  try {
    await fetch('/api/message_add', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        message,
        author,
      }),
    });
    return {
      result: true,
    };
  } catch (err) {
    console.log(err);
    return {
      result: false,
      message: '메세지 등록 실패',
    };
  }
}

const UserHomePage: NextPage<UserProps> = function ({ userInfo }) {
  const [check, setCheck] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [IsNoOne, setNoOne] = useState<boolean>(true);
  const { authUser } = useAuth();
  const toast = useToast();

  if (userInfo === null) {
    console.log(userInfo);
    return (
      <Box>
        <Text> 사용자를 찾을수 없습니다 새로고침이나 다시 로그인 해주세요</Text>
      </Box>
    );
  }

  const onChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(message);
    setMessage(e.currentTarget.value);
    // 개행 문자 확인 여부로 라인 관리
    const lineCount = (e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1) + 1;
    if (lineCount > 10) {
      toast({
        title: '최대 10줄까지 입력 가능합니다',
        position: 'top-start',
      });
      setCheck(false);
    }
  };

  const checkUser = () => {
    if (authUser === null) {
      toast({
        title: '로그인 후 사용 가능합니다',
        position: 'top-start',
      });
      return;
    }
    setNoOne((prev) => !prev);
  };

  return (
    <ServiceLayout title="username" minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex>
            <Avatar size="lg" src={userInfo?.photoURL ?? 'https://bit.ly/broken-link'} mr="2" />
            <Flex direction="column" justify="center">
              <Text fontWeight="bold" fontSize="md">
                {userInfo?.displayName}
              </Text>
              <Text fontSize="md">{userInfo?.email}</Text>
            </Flex>
          </Flex>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex align="center" padding="2">
            <Avatar
              size="xs"
              mr="2"
              src={IsNoOne ? 'https://bit.ly/broken-link' : authUser?.photoURL ?? 'https://bit.ly/broken-link'}
            />
            <Textarea
              bg="gray.100"
              border="none"
              placeholder="궁금한걸 물어보세요!"
              resize="none"
              minH="unset"
              overflow="hidden"
              fontSize="xs"
              mr="3"
              minRows={1}
              maxRows={10}
              as={FlexiableTextArea}
              value={message}
              onChange={onChangeMessage}
            />
            {/**나중에 따로 onclick 빼내기 */}
            <Button
              onClick={async () => {
                const postData: {
                  message: string;
                  uid: string;
                  author?: {
                    displayName: string;
                    photoURL: string;
                  };
                } = {
                  message,
                  uid: userInfo.uid,
                };
                if (IsNoOne === false) {
                  postData.author = {
                    photoURL: authUser?.photoURL ?? 'https://bit.ly/broken-link',
                    displayName: authUser?.displayName ?? 'IsNoOne',
                  };
                }
                const messageRes = await postMessage(postData);

                if (messageRes.result === false) {
                  toast({
                    title: '메세지 등록 실패',
                    position: 'top-start',
                  });
                }
              }}
              disabled={!check}
              bgColor="#26bd00d6"
              color="white"
              colorScheme="yellow"
              variant="solid"
              size="sm"
            >
              올리기
            </Button>
          </Flex>
          <FormControl p="1" mt="1" display="flex" alignItems="center">
            <Switch mr="2" size="sm" colorScheme="orange" id="익명" isChecked={IsNoOne} onChange={checkUser} />
            <FormLabel htmlFor="익명" mb="1" fontSize="xs">
              익명
            </FormLabel>
          </FormControl>
          {/*{message.length},{check}*/}
        </Box>
      </Box>
    </ServiceLayout>
  );
};

export default UserHomePage;
