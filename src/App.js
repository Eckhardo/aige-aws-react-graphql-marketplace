import React from "react";
import "./App.css";
import {AmplifyTheme, Authenticator} from 'aws-amplify-react';
import {API, Auth, graphqlOperation, Hub} from 'aws-amplify';
import {getUser} from "./graphql/queries";
import {registerUser} from "./graphql/mutations";
import {Route, Router} from 'react-router-dom';
import {createBrowserHistory} from "history";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import NavBar from "./components/Navbar";

export const history = createBrowserHistory();
export const UserContext = React.createContext();

class App extends React.Component {
    state = {
        user: null,
        userAttributes: null
    };

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        console.log("App  did Update now", this.state);


    }

    componentDidMount() {

        //  console.dir(AmplifyTheme);
        this.getUserData();
        Hub.listen('auth', (data) => {
            const {payload} = data;
            this.onAuthEvent(payload);
            console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event);
        })

    }

    componentWillUnmount() {
        console.log("App anmounts.....")
    }

    registerNewUser = async (signInData) => {
        console.log("signInData: ", signInData);
        const signInInput = {
            id: signInData.signInUserSession.idToken.payload.sub
        }
        console.log("input: ", signInInput);
        const {data} = await API.graphql(graphqlOperation(getUser, signInInput));
        if (!data.getUser) {
            try {
                const registerInput = {
                    ...signInInput,
                    usenamer: signInData.username,
                    email: signInData.signInUserSession.idToken.payload.email,
                    registered: true

                }
                console.log("registerInput: ", registerInput);
                const newUser = await API.graphql(graphqlOperation(registerUser, {input: registerInput}));
                console.log("newUser: ", newUser);
            } catch (e) {
                console.error('Error registering the user', e);

            }
        }
        console.log("result:", data);
    }

    getUserData = async () => {
        let userData = await Auth.currentAuthenticatedUser();
        userData ? this.setState({user: userData},
            () => this.getUserAttributes(this.state.user)) : this.setState({user: null});

    }
    getUserAttributes = async (userData) => {
        const attributesArr = await Auth.userAttributes(userData);

        console.log("attributes:", {attributesArr});
        // convert array to an object
        const obj = Object.assign({}, attributesArr);
        this.setState({userAttributes: obj});
        console.log("attributes2:", this.state.userAttributes);
    }
    onAuthEvent = payload => {
        switch (payload.event) {
            case "signIn":
                this.getUserData();
                this.registerNewUser(payload.data);
                break;
            case "signUp":
                break;
            case "signOut":
                this.setState({user: null});
                break;
            default:
                return;
        }
    }
    handleSignOut = async () => {
        try {
            Auth.signOut();
        } catch (error) {
            console.error('TError signing out user', error);
        }
    }

    render() {

        const {user, userAttributes} = this.state;
        let displayedJsx = null;
        if (!user) {
            displayedJsx = (
                <Authenticator theme={theme}/>
            );
        } else {
            displayedJsx = (

                <UserContext.Provider value={{user}}>
                    <Router history={history}>
                        <React.Fragment>

                            {/* Navigation */}
                            <NavBar user={user} handleSignOut={this.handleSignOut}/>
                            {/* Routes */}
                            <div className="app-container">
                                <Route exact path="/" component={HomePage}/>
                                {/* if ProfilePage mounts, transport the user*/}
                                <Route path="/profile"
                                       component={() => <ProfilePage
                                           user={user}
                                           userAttributes={userAttributes}/>}
                                />
                                <Route path="/market/:marketId" component={
                                    ({match}) => <MarketPage user={user} marketId={match.params.marketId}/>
                                }/>
                            </div>
                        </React.Fragment>

                    </Router>
                </UserContext.Provider>
            );
        }
        return (
            <div>
                {displayedJsx}
            </div>
        )
    }
}

// inline style - alternative to an own App.css file
const theme = {
    ...AmplifyTheme,
    navBar: {
        ...AmplifyTheme.navBar,
        backgroundColor: "#FF9900"
    },
    button: {
        ...AmplifyTheme.button,
        backgroundColor: "#FF9900"
    },
    sectionBody: {
        ...AmplifyTheme.sectionBody,
        padding: "30px",

    },
    sectionHeader: {
        ...AmplifyTheme.sectionHeader,
        backgroundColor: "#232F3E",
        padding: '20px'
    }
};

export default App;
