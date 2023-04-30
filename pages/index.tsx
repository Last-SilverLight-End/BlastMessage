import { NextPage } from 'next';

import { Box, Center, Flex, Heading } from '@chakra-ui/react';

import { ServiceLayout } from '@/Components/ServiceLayout';
import { GoogleLoginButton } from '@/Components/GoogleLoginButton';
import FirebaseClient from '@/models/firebase_client';
import { useAuth } from '@/contexts/auth_user.context';

const IndexPage: NextPage = function () {
  const { signInWithGoogle } = useAuth();
  return (
    <ServiceLayout title="test" backgroundColor="gray.100">
      <Box maxW="md" mx="auto" pt="10">
        <img src="/main_logo.svg" alt="메인로고" />
        <Flex justify="center">
          <Heading>#blastBlast</Heading>
        </Flex>
      </Box>
      <Center mt="20">
        <GoogleLoginButton onClick={signInWithGoogle} />
      </Center>
    </ServiceLayout>
  );
};

export default IndexPage;
