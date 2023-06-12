import { NextPage } from 'next';

import { Box, Center, Flex, Heading } from '@chakra-ui/react';

import { ServiceLayout } from '@/Components/ServiceLayout';
import { GoogleLoginButton } from '@/Components/GoogleLoginButton';

import { useAuth } from '@/contexts/auth_user.context';

const IndexPage: NextPage = function () {
  const { signInWithGoogle } = useAuth();

  return (
    <ServiceLayout title="test" backgroundColor="green.200">
      <Center>
        <Box maxW="md" m="auto" pt="10">
          <img src="/unknown.png" alt="메인로고" />
          <Flex justify="center">
            <Heading color="black.100">BlastChat</Heading>
          </Flex>
          <Center mt="20" mb="20">
            <GoogleLoginButton onClick={signInWithGoogle} />
          </Center>
        </Box>
      </Center>
    </ServiceLayout>
  );
};

export default IndexPage;
