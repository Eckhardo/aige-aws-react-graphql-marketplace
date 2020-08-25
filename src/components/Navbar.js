import React from "react";
import {Button, Icon, Menu as Nav} from "element-react";
import {NavLink} from "react-router-dom";


const Navbar = ({user, handleSignOut}) => {
    return (
        <div>
            <Nav mode="horizontal" theme="dark" defaultActive="1">
                <div className="nav-container">
                    {/* App title, Icon*/}
                    <Nav.Item index="1">
                        <NavLink to="/" className="nav-link">
                <span className="app-title">
                        AmplifyEckhardo
                </span>
                        </NavLink>
                    </Nav.Item>
                    {/* Nav Items */}
                    <div className="nav-items">
                        <Nav.Item index="2">
                            <span className="app-user"> Hello, my {user.username} </span>
                        </Nav.Item>
                        <Nav.Item index="3">
                            <NavLink to="/profile" className="nav-link">
                                <Icon name="setting">
                                    Profile
                                </Icon>
                            </NavLink>
                        </Nav.Item>
                        <Nav.Item index="4">
                            <Button type="warning" onClick={handleSignOut}>Sign Out </Button>
                        </Nav.Item>
                    </div>
                </div>
            </Nav>
        </div>)
};

export default Navbar;
