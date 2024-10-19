import { DatabaseCalls } from "@applicantiq/applicantiq_core/Core/databaseCalls";
import { GlassdoorScraperError } from "@applicantiq/applicantiq_core/Core/errors";

export class GlassdoorScrapingFunctions {
    static getCompaniesJson = async (company: string):Promise<[Record<string, any>]> => {
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "TE": "trailers",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://www.glassdoor.com/",
            "Priority": "u=4",
            "Connection": "keep-alive",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept": "*/*"
        };
        const response = await fetch(`https://www.glassdoor.com/api-web/employer/find.htm?autocomplete=true&maxEmployersForAutocomplete=10&term=${company}`, {
            method: 'GET',  // or 'POST', depending on the request
            headers: headers
        })
        const responseJson = await response.json();
        return responseJson;
    }
    static getPageSource = async (url: string):Promise<string> => {
        const headers = {
            "Accept":  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            "Dnt": "1",
            "Priority": "u=0, i",
            "Referer": "https://www.google.com/",
            'Sec-Ch-Ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
            "Sec-Ch-Ua-Arch": "",
            "Sec-Ch-Ua-Bitness": "64",
            "Sec-Ch-Ua-Full-Version": "129.0.6668.70",
            "Sec-Ch-Ua-Full-Version-List": '"Google Chrome";v="129.0.6668.70", "Not=A?Brand";v="8.0.0.0", "Chromium";v="129.0.6668.70"',
            "Sec-Ch-Ua-Mobile": "?1",
            "Sec-Ch-Ua-Model": "Nexus 5",
            "Sec-Ch-Ua-Platform": "Android",
            "Sec-Ch-Ua-Platform-Version": "6.0",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'
        }
        console.log(url);
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        })
        if (!response.ok){
            console.warn("FAILED GRABBING GLASSDOOR");
            console.warn(response.status);
            console.warn(response)
            throw new GlassdoorScraperError("Couldn't get page source");
        }
        const html = await response.text();
        console.debug(html);
        return html;
    }
    static overview(employer: string, employer_id: string) {
        employer = employer.replace(/ /g, "-");
        let url = `https://www.glassdoor.com/Overview/Working-at-${employer}-EI_IE${employer_id}`;
        
        // Find the starting and ending positions of the employer name in the URL
        let _start = url.split("/Overview/")[1].indexOf(employer);
        let _end = _start + employer.length;
        
        // Add the slice position to the URL
        url += `.${_start},${_end}.htm`;
        
        return url;
    }
    static scrape = async (company: string):Promise<Record<string, any>> => {
        const companiesJson: [Record<string, any>] = await GlassdoorScrapingFunctions.getCompaniesJson(company);
        console.debug("Got companies back of:");
        console.debug(companiesJson);
        if (!companiesJson.length){
            return {pageSource: null, url: null, noCompanies: true};
        }
        const bestMatch = companiesJson[0];
        const overviewUrl = GlassdoorScrapingFunctions.overview(bestMatch["label"], bestMatch["id"]);
        const pageSource = await GlassdoorScrapingFunctions.getPageSource(overviewUrl);
        return {pageSource: pageSource, url: overviewUrl, noCompanies: false};
    }
} 