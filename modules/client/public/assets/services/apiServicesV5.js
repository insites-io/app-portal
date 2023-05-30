var apiServicesV5 = (function () {

    let config = {
        headers: {
            "Content-Type": "application/json",
            "Authorization":"instance_92d3be32-b64f-4909-91fe-2db66783f617_q7V-rkI5fYMmz2TtJ8NfQuuL2BaKhkDMChITkejdLK8"
        }
    };

    async function processRequest(method, url, payload){
        console.log("processRequest v5");
    
        var requestOptions = {
            method: method,
            body: payload,
            redirect: "follow",
            headers: config.headers
        };
    
        return fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(typeof result);
                console.log(result);
                let data = JSON.parse(result);
                console.log(typeof data);
                console.log(data);

                if (data.items.id){
                    console.log("id exist");
                    return { state: true, status: "success" }; 
                }else{
                    console.log("id NOT exist");
                    return { state: true, status: "failed" }; 
                }                                            
                       
        })
        .catch(error => {
            return { state: false, data: error };
        });
    }

    return {
        processRequest: processRequest
    };

})();