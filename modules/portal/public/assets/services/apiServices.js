const apiServices = (() => {
    const apiUrl = "/api";
    const request = axios.create({});

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.content
        }
    };

    // Axios Processor
    const processRequest = async (method, url, payload, headers = config.headers) => {
        const endpoint = apiUrl + url;
        const isGet = method.toLowerCase() === 'get';
        
        try {
            const response = await (isGet
                ? request.get(endpoint, { headers })
                : request[method](endpoint, payload, { headers }));

            if (response.data.errors) {
                if (typeof response.data.errors === "object" && !Object.keys(response.data.errors).length) {
                    return { state: true, data: response.data };
                } else {
                    console.error(`API Error: ${url}`, response.data.errors);
                    return { state: false, data: response.data };
                }
            }
            return { state: true, data: response.data };
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.errors) {
                console.error(`API Error: ${url}`, errorData.errors);
            }
            return { state: false, data: errorData || error.message };
        }
    };

    return {
        processRequest
    };
})();