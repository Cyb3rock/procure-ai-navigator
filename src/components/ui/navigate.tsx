
import { Navigate as RouterNavigate, NavigateProps as RouterNavigateProps } from 'react-router-dom';

interface NavigateProps extends RouterNavigateProps {}

export const Navigate = (props: NavigateProps) => <RouterNavigate {...props} />;
