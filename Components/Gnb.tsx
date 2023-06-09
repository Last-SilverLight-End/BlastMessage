import { Box, Button, Flex, Spacer } from '@chakra-ui/react';
import { useAuth } from '@/contexts/auth_user.context';

const Gnb = function () {
  const { loading, authUser, signOut, signInWithGoogle } = useAuth();

  const loginBtn = (
    <Button
      fontSize="sm"
      fontWeight={600}
      color="white"
      bg="green.400"
      _hover={{ bg: 'green.300' }}
      onClick={signInWithGoogle}
    >
      로그인
    </Button>
  );
  const logoutBtn = (
    <Button as="a" fontWeight={400} onClick={signOut}>
      {signOut}
      로그아웃
    </Button>
  );
  const authInitialized = loading || authUser === null;
  return (
    <Box borderBottom={1} borderStyle="solid" borderColor="gray.200" bg="white">
      <Flex minH="60px" py={{ base: 2 }} px={{ base: 4 }} align="center" maxW="md" mx="auto">
        <Spacer />
        <Box flex="1">
          <img style={{ height: '40px' }} src="/slimesafd.png" alt="logo" />
        </Box>
        <Box justifyContent="flex-end">{authInitialized ? loginBtn : logoutBtn}</Box>
      </Flex>
    </Box>
  );
};

export default Gnb;
