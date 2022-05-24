import { Injectable } from "@angular/core";

@Injectable // class annotation as Injectable, "so that you can inject it in the constructor i.e."
    ({
        providedIn: 'root'
    })
export class mediaSearchOptions {
    //TODO optional generate searchFields via Object.keys from fronToBackendFieldName
    private searchFields = ["No restriction", "Author", "Description", "Developer", "Isbn", "Publisher", "Release Year", "Title"]
    private languages = ["-- All --", "English", "German"];
    private frontToBackendFieldName = {
        "No restriction": "none",
        "Author": "authors",
        "Description": "description",
        "Developer": "developer",
        "Isbn": "isbn",
        "Publisher": "publisher",
        "Release Year" : "releaseYear",
        "Title": "title"
    }
    // toDO (genre would have to be extended to include game/music/movies genres) or adapt genre in selection pages depending on media typ
    // could also argue, that priority for the lib is on books, therefore search pages only filter genres by books (for now)
    private genres = ["-- All --", "Adventure",  "Art", "Children", "Cooking", "Crafts, Hobbies & Home", "Crime","--Disk--", "Education", "Fantasy","--Game--", "Health & Fitness", "Historical", "Horror", "Humor", "Motivational", "Politics", "Religiion", "Roman", "Romance", "Thriller", "Sci-fi", "--VideoGame--"]
    private mediaTypes = ["-- All --", "Book", "CD / DVD / Blu-Ray", "electronical Game", "Game", "Magazine"];
    private searchOperators = ["and", "or", "not"];

    getSearchFields() {
        // return this.searchFields;
        return Object.keys(this.frontToBackendFieldName)
    }
    getLanguages() {
        return this.languages;
    }
    getGenres() {
        return this.genres;
    }
    getMediaTypes() {
        return this.mediaTypes;
    }
    getSearchOperators() {
        return this.searchOperators;
    }

    // return a readable string of the search querry used. Omitting unused fields
    // probally less ideal spot for this functionality
    getSearchedForString(data) {
        let searchString = "";

        // if only 1 key is in data simple search was used
        // if more extended search, if neither is the case there must be an error
        if (Object.keys(data).length == 1) {
            searchString = data.searchTerm0;
        } else if (Object.keys(data).length > 1) {
            //##first search querry##
            //check if searchTerm is not empty;
            //  true: then if search was restricted, false: skip
            if (data.searchTerm0 != "") {
                if (data.searchField0 == this.searchFields[0]) {
                    searchString += data.searchTerm0 + ", ";
                } else {
                    searchString += data.searchTerm0 + " in " + data.searchField0 + ", ";
                }
            }
            //##second search querry##
            //check if searchTerm is not empty;
            //  true: then if search was restricted, false: skip
            if (data.searchTerm1 != "") {
                if (data.searchField1 == this.searchFields[0]) {
                    searchString += data.searchOperator1.toLowerCase() + " " + data.searchTerm1 + ", ";
                } else {
                    searchString += data.searchOperator1.toLowerCase() + " " + data.searchTerm1 + " in " + data.searchField1 + ", ";
                }
            }
            //##third search querry##
            //check if searchTerm is not empty;
            //  true: then if search was restricted, false: skip
            if (data.searchTerm2 != "") {
                if (data.searchField2 == this.searchFields[0]) {
                    searchString += data.searchOperator2.toLowerCase() + " " + data.searchTerm2 + ", ";
                } else {
                    searchString += data.searchOperator2.toLowerCase() + " " + data.searchTerm2 + " in " + data.searchField2 + ", ";
                }
            }

            //check if language, genre, mediaTyp have restriction -> if not, skip them
            if (data.language != this.languages[0]) {
                searchString += "language: " + data.language + ", ";
            }
            if (data.genre != this.genres[0]) {
                searchString += "genre: " + data.genre + ", ";
            }
            if (data.mediaType != this.mediaTypes[0]) {
                searchString += "media type: " + data.mediaType + ", ";
            }
            //optional remove last "," from string or put ", " at the start instead and remove the ";" from media-search-result.html

            // unexpected data length. return an error    
        } else {
            return "error getting search string";
        }
        return searchString;
    }


    /*
    * For simplicity reasons boolean search operators (and, or, not) from the field are connected in order they were choose
    *    and not focused on higher priority order of certain opertatos. 
    * (Furthermore, additional operator (and,or, not, *,?,..) in an input field are also not support right now)
    */
    simplifySearchObject(data) {
        let obj = {}
        if (Object.keys(data).length == 1) { //quick Search was used 
            obj["searchTerm0"] = {}
            obj["searchTerm0"]["field"] = "none";// { "none": data.searchTerm0 };
            obj["searchTerm0"]["value"] = data.searchTerm0;
        } else {
            //##first search querry##
            //check if searchTerm is not empty;
            //  true: search was restricted, false: skip
            if (data.searchTerm0 !== "") {
                obj["searchTerm0"] = {};
                obj["searchTerm0"]["field"] = this.frontToBackendFieldName[data.searchField0]
                obj["searchTerm0"]["value"] = data.searchTerm0;
            }
            //##second search querry##
            //check if searchTerm is not empty;
            //  true: search was restricted, false: skip
            if (data.searchTerm1 !== "") {
                obj["searchTerm1"] = {};
                obj["searchTerm1"]["field"] = this.frontToBackendFieldName[data.searchField1]
                obj["searchTerm1"]["operator"] = data.searchOperator1;
                obj["searchTerm1"]["value"] = data.searchTerm1;
            }
            //##third search querry##
            //check if searchTerm is not empty;
            //  true: search was restricted, false: skip
            if (data.searchTerm2 !== "") {
                obj["searchTerm2"] = {};
                obj["searchTerm2"]["field"] = this.frontToBackendFieldName[data.searchField2]
                obj["searchTerm2"]["operator"] = data.searchOperator2;
                obj["searchTerm2"]["value"] = data.searchTerm2;
            }
            //check if language, genre, mediaTyp have restriction -> if not, skip them
            if (data.language != this.languages[0]) {
                obj["language"] = data.language
            }
            if (data.genre != this.genres[0]) {
                obj["genre"] = data.genre
            }
            if (data.mediaType != this.mediaTypes[0]) {
                obj["mediaType"] = data.mediaType
            }
        }
        return obj;
    }

    /**
     * Flatten a given (nested) object to an unflatten object. The unflatten object contains information about being flatten
     * (i.e key1.keys2: value)
     * 
     * @param object nested object to be flatten
     * @param prefix prefix for recursive calls (to keep nested information)
     * @param res 
     * @returns flatten object
     */
    flattenObject(object, prefix = '', res = {}) {
        Object.entries(object).reduce((r, [key, val]) => {
            const k = `${prefix}${key}`
            if (typeof val === "object") {
                this.flattenObject(val, `${k}.`, r)
            } else {
                res[k] = val
            }
            return r
        }, res)
        return res;
    }

    /**
     * 
     * @param mediaType 
     * @returns css class name of scalable vector icon (font awesome icon)
     */
    getSvg(mediaType: string) {
        switch (mediaType) {
            case this.mediaTypes[1]: return "fas fa-book";  //"menu_book";
            case this.mediaTypes[2]: return "fas fa-compact-disc"; //"album";
            case this.mediaTypes[3]: return "fas fa-gamepad"; //"videogame_asset";
            case this.mediaTypes[4]: return "fas fa-dice";// "casino";
            case this.mediaTypes[5]: return "far fa-newspaper"; // "article";
            default: return "fas fa-bug"; // error svg ;
        }
    }
}