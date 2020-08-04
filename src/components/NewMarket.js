import React from "react";
import {API, graphqlOperation} from 'aws-amplify';
import {createMarket} from "../graphql/mutations";
import {UserContext} from "../App";
// prettier-ignore
import {Button, Dialog, Form, Input, Notification, Select} from 'element-react'

class NewMarket extends React.Component {
    //  state
    state = {
        name: "",
        tags: ["Fishing", "Birdwatching", "Cycling"],
        selectedTags: [],
        options: [],
        addMarketDialog: false
    };
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("NewMarket did Update", this.props);
    }
    // handler
    handleAddMarket = async (user) => {
        this.setState({addMarketDialog: false});
        const input = {name: this.state.name, tags: this.state.selectedTags, owner: user.username};
        try {
            await API.graphql(graphqlOperation(createMarket, {input}));
            this.setState({name: "", selectedTags: []});
        } catch (err) {
            Notification.error({title: "Error", message: `${err.message || "Error adding market"}`})
        }
    }

    handleFilterTags = query => {
        const options = this.state.tags
            .map(tag => ({value: tag, label: tag}))
            .filter(tag => tag.label.toLowerCase().includes(query.toLowerCase())
            );
        this.setState({options: options});
    }

    //   render view
    render() {
        return (
            <UserContext.Consumer>
                {/* Some obscure closure construct...*/}
                {({user}) => <React.Fragment>
                    <div className="market-header">
                        <h1 className="market-title">
                            Create your MarketPlace
                            <Button onClick={() => this.setState({addMarketDialog: true})}
                                    type="text"
                                    icon="edit"
                                    className="market-title-button"/>
                        </h1>
                        <Form inline={true} onSubmit={this.props.handleSearch}>
                            <Form.Item>
                                <Input
                                    value={this.props.searchTerm}
                                    placeholder="Search Markets..."
                                    icon="circle-cross"
                                    onIconClick={this.props.handleClearSearch}
                                    onChange={this.props.handleSearchChange}/>
                            </Form.Item>
                            <Form.Item>
                                <Button icon="search"
                                        type="info"
                                        onClick={this.props.handleSearch}
                                        loading={this.props.isSearching}>
                                    Search
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                    <Dialog
                        title="Create New Market"
                        visible={this.state.addMarketDialog}
                        onCancel={this.setState.bind(this, [{addMarketDialog: false}])}
                        size="large"
                        customClass="dialog">
                        <Dialog.Body>
                            <Form labelPosition="top">
                                <Form.Item label="Add Market Name">
                                    <Input
                                        placeholder="Market Name"
                                        trim={true}
                                        onChange={name => this.setState({name})}
                                        value={this.state.name}>
                                    </Input>
                                </Form.Item>
                                <Form.Item label="Add Tags">
                                    <Select
                                        multiple={true}
                                        filterable={true}
                                        placeholder="Add Tags"
                                        onChange={selectedTags => this.setState({selectedTags})}
                                        remoteMethod={this.handleFilterTags}
                                        remote={true}>
                                        {this.state.options.map(option => (
                                            <Select.Option
                                                value={option.value}
                                                label={option.label}
                                                key={option.value}
                                            />
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button onClick={() => this.setState({addMarketDialog: false})}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                disabled={!this.state.name}
                                onClick={() => this.handleAddMarket(user)}>
                                Add
                            </Button>
                        </Dialog.Footer>
                    </Dialog>

                </React.Fragment>
                }
                {/*... end of some obscure closure construct */}
            </UserContext.Consumer>
        )
    }
}

export default NewMarket;
