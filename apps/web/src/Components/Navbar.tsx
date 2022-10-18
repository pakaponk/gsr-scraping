import {
  Avatar,
  Box,
  BoxProps,
  Button,
  Container,
  Flex,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useAuth } from '../Hooks/useAuth';

const Header = ({ children }: PropsWithChildren<BoxProps>) => (
  <Box
    as="header"
    position="fixed"
    top="0"
    left="0"
    right="0"
    bgColor="gray.100"
    zIndex="banner"
    shadow="base"
  >
    {children}
  </Box>
);

export const Navbar = () => {
  const [{ user }] = useAuth();

  return (
    <Header>
      <Container py={2} maxWidth="full">
        <Flex alignItems="center" height="full">
          <HStack spacing="4">
            <Avatar name={user?.name} />
            <Text>{user?.name}</Text>
          </HStack>
          <Spacer />
          <Button variant="outline" colorScheme="blue">
            Sign out
          </Button>
        </Flex>
      </Container>
    </Header>
  );
};
