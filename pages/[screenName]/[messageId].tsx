import { GetServerSideProps, NextPage } from 'next';
import { Avatar, Box, Text, Flex } from '@chakra-ui/react';

import { useState } from 'react';

import axios, { AxiosResponse } from 'axios';

import { ServiceLayout } from '@/Components/ServiceLayout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/Components/message_item';
import { InMessage } from '@/models/message/in_message';

interface UserProps {
  userInfo: InAuthUser | null;
  messageData: InMessage | null;
}

const MessagePage: NextPage<UserProps> = function ({ userInfo }: any) {
  const [messageData, setMessageData] = useState<null | InMessage>(null);
  const { authUser } = useAuth();

  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const res = await fetch(`/api/message_info?uid=${uid}&messageId=${messageId}`);
      if (res.status === 200) {
        const data: InMessage = await res.json();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (userInfo === null || userInfo === undefined) {
    return <Text> 사용자를 찾을수 없습니다 새로고침이나 다시 로그인 해주세요</Text>;
  }
  if (userInfo.photoURL == null) {
    return <Text>잘못되었습니다</Text>;
  }

  const isOwner = authUser !== null && authUser.uid === userInfo.uid;

  if (messageData === null) {
    return <p>메세지 정보가 없습니다.</p>;
  }
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
        <MessageItem
          item={messageData}
          uid={userInfo.uid}
          displayName={userInfo.displayName ?? ''}
          photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
          owner={isOwner}
          onSendComplete={() => {
            fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id });
          }}
        />
      </Box>
    </ServiceLayout>
  );
};

export const getServerSideProps: GetServerSideProps<UserProps> = async ({ query }) => {
  const { screenName, messageId } = query;
  if (screenName === undefined) {
    return {
      props: {
        userInfo: null,
        messageData: null,
      },
    };
  }
  if (messageId === undefined) {
    return {
      props: {
        userInfo: null,
        messageData: null,
      },
    };
  }
  try {
    const protocol = process.env.PROTOCOL ?? 'http';
    const port = process.env.PORT ?? '3000';
    const host = process.env.HOST ?? 'localhost';
    const curUrl = `${protocol}://${host}:${port}`;

    const userInfoAxios: AxiosResponse<InAuthUser> = await axios(`${curUrl}/api/user_info/${screenName}`);
    if (userInfoAxios.status !== 200 || userInfoAxios.data === undefined || userInfoAxios.data.uid === undefined) {
      return {
        props: {
          userInfo: userInfoAxios.data ?? null,
          userMessage: null,
        },
      };
    }
    const messageInfoAxios = await axios<InMessage>(
      `${curUrl}/api/messages.info?uid=${userInfoAxios.data.uid}&messageId=${messageId}`,
    );

    return {
      props: {
        userInfo: userInfoAxios.data,
        userMessage:
          messageInfoAxios.status !== 200 || messageInfoAxios.data === undefined ? null : messageInfoAxios.data,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
        userMessage: null,
      },
    };
  }
};

export default MessagePage;
