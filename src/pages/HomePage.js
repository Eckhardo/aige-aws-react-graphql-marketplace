import React from "react";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";
import {searchMarkets} from "../graphql/queries";
import {API, graphqlOperation} from "aws-amplify";

class HomePage extends React.Component {
    state = {
        searchTerm: "",
        searchResult: [],
        isSearching: false
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("HomePage did Update", this.state);
    }

    handleSearch = async (event) => {
        try {
            event.preventDefault();
            console.log(" searchTerm:", this.state.searchTerm);
            this.setState({isSearching: true});
            const result = await API.graphql(graphqlOperation(searchMarkets, {
                filter: {
                       name: {matchPhrasePrefix: this.state.searchTerm}
                },
                sort:{
                    field: "name",
                    direction:"desc"
                }
            }));
            console.log(" result:", result.data.searchMarkets.items);
            this.setState({searchResult: result.data.searchMarkets.items, isSearching:false})
        } catch (error) {
            console.error("Error in Search Markets", error);
        }

    }
    handleSearchChange = (searchTerm) => {
        this.setState({searchTerm: searchTerm});
    }
    handleClearSearch = () => this.setState({searchTerm: "", searchResult: []})


    render() {
        return (
            <>
                <NewMarket
                    searchTerm={this.state.searchTerm}
                    isSearching={this.state.isSearching}
                    handleSearchChange={this.handleSearchChange}
                    handleClearSearch={this.handleClearSearch}
                    handleSearch={this.handleSearch}
                />
                <MarketList searchResults={this.state.searchResult}/>
            </>
        )
    }
}

export default HomePage;
