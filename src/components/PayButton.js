import React from "react";
import StripeCheckout from "react-stripe-checkout";
import {API, graphqlOperation} from 'aws-amplify';
import {createOrder} from "../graphql/mutations";
import {Message, Notification} from 'element-react';
import {history} from "../App";
import {getUser} from "../graphql/queries";

const PayButton = ({product, user}) => {


    const config = {
        currency: "EUR",
        publishableAPIKey: "pk_test_51HD8KaLFtcWkU2NXNytQ1iLs2wXqZUhhnWlkwhP81yPC4VoyKzLEcOGrzghITOSMmjqB3bh9jt238ctdraDsLP2j00IzEbOZz6"
    }
    const getOwnerEmail = async (ownerId) => {
        try {
            const input = {id: ownerId}
            const user = await API.graphql(graphqlOperation(getUser, input));
            return user.data.getUser.email;
        } catch (e) {
            console.log(`Error to retrieve owners's email`, e);
        }
    }

    const createShippingAddress = source => ({

        city: source.address_city,
        countrey: source.address_country,
        address_line1: source.address_line1,
        address_state: source.address_state,
        address_zip: source.address_zip

    })
    const handleCharge = async token => {
        const ownerEmail = await getOwnerEmail(product.owner);
        try {
            const result = await API.post('orderlambda', '/charges', {
                body: {
                    token,
                    charge: {
                        currency: config.currency,
                        amount: product.price,
                        description: product.description
                    },
                    email: {
                        customerEmail: user.attributes.email,
                        ownerEmail,
                        shipped: product.shipped

                    }
                }
            })
            if (result.charge.status === 'succeeded') {
                let shippingAddress = null;
                if (product.shipped) {
                    shippingAddress = createShippingAddress(result.charge.source);
                }
                const input = {
                    orderUserId: user.attributes.sub,
                    orderProductId: product.id,
                    shippingAddress
                }
                const orderResult = await API.graphql(graphqlOperation(createOrder, {input}));

                Notification({
                    title: 'Success',
                    message: `${orderResult.message}`,
                    type: 'success',
                    timeOut: 3000

                })
                setTimeout(() => {
                    history.push('/');
                    Message({
                        type: 'info',
                        message: 'Check your verified email for order messages',
                        duration: 5000,
                        showClose: true
                    })
                }, 3000)
            }
        } catch (err) {
            console.error(err);
            Notification.error({
                type: 'error',
                title: 'Error',
                message: `${err.message || 'Error processing order'}`

            })
        }
    }
    return (
        <StripeCheckout
            token={handleCharge}
            email={user.attributes.email}
            name={product.description}
            price={product.price}
            shippingAddress={product.shipped}
            billingAddress={product.shipped}
            currency={config.currency}
            stripeKey={config.publishableAPIKey}
            locale="auto"
            allowRememberMe={false}/>

    );
};

export default PayButton;
