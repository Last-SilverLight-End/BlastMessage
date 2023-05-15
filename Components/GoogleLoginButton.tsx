/* eslint-disable prettier/prettier */
import { ChakraProvider, Box, Button } from '@chakra-ui/react';

interface props {
  onClick: () => void;
}

export const GoogleLoginButton = function ({onClick} : props) {
  return( 
  <Box >
    <Button 
    size ="lg"  
    width="full"
    maxW="md" 
    borderRadius="full"
    bgColor="#4285f4" 
    color="white" 
    colorScheme="blue" 
    leftIcon={<img src="/google.svg" alt="google 로고" style={{padding : '8px', backgroundColor:'white'}}/>}
    onClick ={onClick}
    >Google 계정으로 시작하기</Button>
  </Box>);
};