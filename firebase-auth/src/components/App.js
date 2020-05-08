import React , {useContext} from 'react';
import '../App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Profile from './Profile';
import Home from './Home';
import Landing from './Landing';
import University from './University';
import Navigation from './Navigation';
import { AuthProvider } from '../firebase/Auth';
import { AuthContext } from '../firebase/Auth';
import PrivateRoute from './PrivateRoute';
function App() {
	const { currentUser } = useContext(AuthContext);
	return (
		<AuthProvider>
			<Router>
				<div className='App'>
					<header>
						<Navigation />
					</header>
				</div>
				<Route exact path='/' component={Landing} />
				<Route path='*' component={currentUser?Home:Landing} />
				<Route path='/unversity/:id' exact component={University} />
				<PrivateRoute path='/home' component={Home} />
				<PrivateRoute path='/profile' component={Profile} />
				{/* <Route path='/signin' component={SignIn} /> */}
				{/* <Route path='/signup' component={SignUp} /> */}
			</Router>
		</AuthProvider> 
	);
}

export default App;
