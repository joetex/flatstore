

import flatiron from 'flatiron';
import axios from 'axios';


function ReduceResults(response) {
    let results = [];

    if (!('RelatedTopics' in response.data))
        return results;

    //"RelatedTopics" may be a flat object or have an array of "Topics"
    for (let i in response.data.RelatedTopics) {
        let result = response.data.RelatedTopics[i];
        if (result.Topics) {
            //add regular topics to the results list
            for (let j in result.Topics) {
                let subResult = result.Topics[j];
                if (subResult && subResult.Text && subResult.FirstURL)
                    results.push(subResult)
            }
        } else {
            //add flat topic to results list
            results.push(result)
        }
    }
    return results;
}

export async function SearchDuckDuckGo(query) {
    let url = 'https://api.duckduckgo.com/?t=flatironExample&format=json&q=' + query;
    try {
        let response = await axios.get(url);
        flatiron.set("ddg", response.data);

        flatiron.set("ddgQuery", query);

        let results = ReduceResults(response);
        flatiron.set("ddgResults", results);
        flatiron.set("ddgResultCount", results.length);

        flatiron.set("ddgError", false);
        //OR
//         let obj = {"ddg":response.data,
//         "ddgQuery": query,
//         "ddgResults": results,
//         "ddgResultCount": results.length}
// flatiron.setWithObj(obj)
    }
    catch (error) {
        console.log(error);
        flatiron.set("ddgError", error);
    }
}