import axios from "axios";

const tokenJWT = localStorage.getItem("token")

const customConfig = {
    headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenJWT}`
    }
  };
export const getAccountList = async () => {
    try {
        const account = await axios.get('http://localhost:3002/account', customConfig)
        if (account) return account.data
        else console.log('Not found')
        // await axios.get('http://localhost:3001/account', customConfig).then((res) => {
        //     console.log(res.data.data)
        //     return res.data.data
        // }).catch((err) => {
        //     console.log('Not Found')
        // })
    }
    catch (err) {
        console.log("Not found")
    }    
    
}

export const getAccountById = async (id) => {
    const account = await axios.get(`http://localhost:3002/account/${id}`, customConfig)
    return account.data
}

export const updateAccount = async (id, payload) => {
    const account = await axios.put(`http://localhost:3002/account/${id}`, payload, customConfig)
    return account.data
}