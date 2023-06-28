import { GetServerSideProps, NextPage } from 'next';
import {
  Avatar,
  Box,
  Text,
  Flex,
  Textarea,
  Button,
  useToast,
  FormControl,
  Switch,
  FormLabel,
  VStack,
} from '@chakra-ui/react';
import { TriangleDownIcon } from '@chakra-ui/icons';
import FlexiableTextArea from 'react-textarea-autosize';
import { SetStateAction, useEffect, useState } from 'react';

import axios, { AxiosResponse } from 'axios';
import { ServiceLayout } from '@/Components/ServiceLayout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/Components/message_item';
import { InMessage } from '@/models/message/in_message';
import useIsMount from '@/Components/useIsMount';
import { useQuery } from 'react-query';
interface UserProps {
  userInfo: InAuthUser | null | undefined;
  userMessage: string | null;
}

async function postMsg({
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
      message: '메세지가 없습니다 입력해주세요',
    };
  }

  try {
    await fetch('/api/message_add', {
      method: 'post',
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

const UserHomePage: NextPage<UserProps> = function ({ userInfo }: any) {
  const [check, setCheck] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [IsNoOne, setNoOne] = useState<boolean>(true);
  const [messageList, setMessageList] = useState<Array<InMessage>>([]);
  const [messageListFetchTrig, setMessageListFetchTrig] = useState(false);
  const { authUser } = useAuth();
  const toast = useToast();
  const isMount = useIsMount();

  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const res = await fetch(`/api/message_info?uid=${uid}&messageId=${messageId}`);
      if (res.status === 200) {
        const data: InMessage = await res.json();
        setMessageList((prev) => {
          const findIndex = prev.findIndex((finding) => finding.id === data.id);
          if (findIndex >= 0) {
            const updateArr = [...prev];
            updateArr[findIndex] = data;
            return updateArr;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  const messageListQueryKey = ['messageList', userInfo?.uid, page, messageListFetchTrig];

  useQuery(messageListQueryKey, async () => await axios.get<
    {
      totalElementCount: number;
      totalPages: number;
      page: number;
      size: number;
      content: InMessage[];
    }>(`/api/message_list?uid=${userInfo?.uid}&page=${page}&size=10`),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setTotalPages(data.data.totalPages);
        if (page === 1) {
          setMessageList([...data.data.content]);
          return;
        }
        setMessageList((prev) => [...prev, ...data.data.content]);
      },
    },
  );



  console.log(userInfo);
  if (userInfo === null || userInfo === undefined) {
    return <Text> 사용자를 찾을수 없습니다 새로고침이나 다시 로그인 해주세요</Text>;
  }
  if (userInfo.photoURL == null) {
    return <Text>잘못되었습니다</Text>;
  }

  const isOwner = authUser !== null && authUser.uid === userInfo.uid;

  const onChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(message);
    setMessage(e.currentTarget.value);
    // 개행 문자 확인 여부로 라인 관리
    const lineCount = (e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1) + 1;
    if (lineCount > 10) {
      toast({
        title: '최대 10줄까지 입력 가능합니다',
        position: 'top-left',
      });
      setCheck(true);
      return;
    }
    setCheck(false);
  };

  const checkUser = () => {
    if (authUser === null) {
      toast({
        title: '로그인 후 사용 가능합니다',
        position: 'top-left',
      });
      return;
    }
    setNoOne((prev) => !prev);
  };

  return (
    <ServiceLayout title={`${userInfo.displayName} 의 홈`} minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex>
            <Avatar size="lg" src={userInfo.photoURL} mr="2" />
            <Flex direction="column" justify="center">
              <Text fontWeight="bold" fontSize="md">
                {userInfo.displayName}
              </Text>
              <Text fontSize="md">{userInfo.email}</Text>
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
            <Button
              disabled={message.length === 0}
              bgColor="#26bd00d6"
              color="white"
              colorScheme="yellow"
              variant="solid"
              size="sm"
              onClick={async () => {
                const postData: {
                  message: string;
                  uid: string;
                  author?: {
                    displayName: string;
                    photoURL?: string;
                  };
                } = {
                  message,
                  uid: userInfo.uid,
                };
                if (IsNoOne === false) {
                  postData.author = {
                    photoURL: authUser?.photoURL ?? 'https://bit.ly/broken-link',
                    displayName: authUser?.displayName ?? 'isNoOne',
                  };
                }
                const messageRes = await postMsg(postData);
                if (messageRes.result === false) {
                  toast({ title: '메세지 등록 실패', position: 'top-right' });
                }
                setMessage('');
                setPage(1);
                setTimeout(() => {
                  setMessageListFetchTrig((prev) => !prev);
                }, 75);
              }}
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
        <VStack spacing="12px" mt="6">
          {messageList.map((messageData) => (
            <MessageItem
              key={`message-item-${userInfo.uid}-${messageData.id}`}
              item={messageData}
              uid={userInfo.uid}
              displayName={userInfo.displayName ?? ''}
              photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
              owner={isOwner}
              onSendComplete={() => {
                fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id });
              }}
            />
          ))}

          {/*
        <MessageItem   
            uid="hello"
            photoURL={authUser?.photoURL ?? ''}
            displayName="testest"
            owner
            item={{
              id: 'test',
              message: 'test_hellofuckingworld',
              createAt: '2022-02-31T20:15:55+09:00',
            }}
          />
          <MessageItem
            uid="hello"
            photoURL={authUser?.photoURL ?? ''}
            displayName="testest"
            owner={false}
            item={{
              id: 'test',
              message: 'test_hellofuckingworld',
              createAt: '2022-01-31T20:15:55+09:00',
              reply: 'reply',
              replyAt: '2022-03-31T20:15:55+09:00',
            }}
          />*/}
        </VStack>
        {totalPages > page && (
          <Button
            width="full"
            mt="2"
            fontSize="sm"
            leftIcon={<TriangleDownIcon />}
            onClick={() => {
              setPage((p) => p + 1);
            }}
          >
            더보기
          </Button>
        )}
      </Box>
    </ServiceLayout>
  );
};

export const getServerSideProps: GetServerSideProps<UserProps> = async ({ query }) => {
  const { screenName } = query;
  if (screenName === undefined) {
    return {
      props: {
        userInfo: null,
        userMessage: '찾을수 없습니다',
      },
    };
  }
  try {
    const protocol = process.env.PROTOCOL ?? 'http';
    const port = process.env.PORT ?? '3000';
    const host = process.env.HOST ?? 'localhost';
    const curUrl = `${protocol}://${host}:${port}`;

    const userInfoAxios = await axios<InAuthUser>(`${curUrl}/api/user_info/${screenName}`);

    console.log(userInfoAxios.data);
    return {
      props: {
        userInfo: userInfoAxios.data ?? null,
        userMessage: '가져오기 성공',
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
        userMessage: `에러 발생 : ${err}`,
      },
    };
  }
};

export default UserHomePage;
