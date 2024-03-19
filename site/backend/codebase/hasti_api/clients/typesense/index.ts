// Typesense.Client() has methods for all API operations.
// If you only intend to search through documents (for eg: in the browser),
//    you can also use Typesense.SearchClient().
// This can also help reduce your bundle size by only including the classes you need:

import { SearchClient as TypesenseSearchClient } from "typesense";
let tsClient = new TypesenseSearchClient({
  'nodes': [{
    'host': 'localhost', // For Typesense Cloud use xxx.a1.typesense.net
    'port': 8108,      // For Typesense Cloud use 443
    'protocol': 'http'   // For Typesense Cloud use https
  }],
  'apiKey': process.env.TYPESENSE_API_KEY as string,
  'connectionTimeoutSeconds': 5
})

export default tsClient