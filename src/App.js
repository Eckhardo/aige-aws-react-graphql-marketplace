import React from "react";
import "./App.css";
import {AmplifyTheme, Authenticator} from 'aws-amplify-react';
import {Auth, Hub} from 'aws-amplify';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import NavBar from "./components/Navbar";

export const UserContext = React.createContext();

class App extends React.Component {
    state = {
        user: null
    };
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("App  did Update", this.state);
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


    getUserData = async () => {
        let userData = await Auth.currentAuthenticatedUser();
        userData ? this.setState({user: userData}) : this.setState({user: null});

    }
    onAuthEvent = payload => {
        switch (payload.event) {
            case "signIn":
                this.getUserData();
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

        const {user} = this.state;
        let displayedJsx = null;
        if (!user) {
            displayedJsx = (
                <Authenticator theme={theme}/>
            );
        } else {
            displayedJsx = (

                <UserContext.Provider value={{user}}>
                    <Router>
                        <React.Fragment>

                            {/* Navigation */}
                            <NavBar user={user} handleSignOut={this.handleSignOut}/>
                            {/* Routes */}
                            <div className="app-container">
                                <Route exact path="/" component={HomePage}/>
                                <Route path="/profile" component={ProfilePage}/>
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
