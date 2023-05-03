/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable prettier/prettier */
import { Box, BoxProps } from '@chakra-ui/react';
import Head from 'next/head';
import Gnb from './Gnb';

interface PropsBlast {
  title: string;
  children: React.ReactNode;
}

export const ServiceLayout : React.FC<PropsBlast & BoxProps> = function ({ title = 'blast', children, ...boxProps }) {
  return (
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
      </Head>
      <Gnb/>
      {children}
    </Box>
  );
};
