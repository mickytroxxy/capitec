import axios from 'axios';

export const BASE_URL = 'https://mrdocs-server-225250995708.europe-west1.run.app/api';
type FetchDataTypes = {endPoint: string; method: 'POST' | 'GET' | 'UPDATE' | 'DELETE'; data?: any;};

const useFetch = () => {
    const fetchData = async ({ endPoint, method, data }: FetchDataTypes) => {
        try {
            const url = BASE_URL + endPoint;
            let response = await axios({method, url, data});
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return false;
        }
    };
    return { fetchData };
};

export default useFetch;
