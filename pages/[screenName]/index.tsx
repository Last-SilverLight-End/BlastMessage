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
import FlexiableTextArea from 'react-textarea-autosize';
import { SetStateAction, useState } from 'react';

import axios, { AxiosResponse } from 'axios';
import { ServiceLayout } from '@/Components/ServiceLayout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/Components/message_item';

interface UserProps {
  userInfo: InAuthUser | null | undefined;
  userMessage: string | null;
}

const UserHomePage: NextPage<UserProps> = function ({ userInfo }) {
  const [check, setCheck] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [IsNoOne, setNoOne] = useState<boolean>(true);
  const { authUser } = useAuth();
  const toast = useToast();
  console.log(userInfo);
  if (userInfo === null || userInfo === undefined) {
    return <Text> 사용자를 찾을수 없습니다 새로고침이나 다시 로그인 해주세요</Text>;
  }
  if (userInfo.photoURL == null) {
    return <Text>잘못되었습니다</Text>;
  }

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
    <ServiceLayout title="username" minH="100vh" backgroundColor="gray.50">
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
            <Button disabled={check} bgColor="#26bd00d6" color="white" colorScheme="yellow" variant="solid" size="sm">
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
          <MessageItem />
          <MessageItem />
        </VStack>
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
