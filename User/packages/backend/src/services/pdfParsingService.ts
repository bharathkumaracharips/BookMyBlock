import axios from 'axios'
// TODO: Re-enable PDF parsing once library issues are resolved
// import pdf from 'pdf-parse'

export interface TheaterLocationData {
  theaterName: string
  pincode: string
  city: string
  state: string
  address: string
  totalSeats: number
  numberOfScreens: number
  ownerName: string
  ownerEmail: string
  ownerPhone: string
}

export class PDFParsingService {
  /**
   * Extract theater data from PDF text content
   * This assumes the PDF follows the format we saw in the Owner's PDF generation
   */
  static extractTheaterDataFromPDFText(pdfText: string): TheaterLocationData | null {
    try {
      console.log('🔍 Parsing PDF text for theater data...')
      
      // Extract theater details using regex patterns
      const theaterNameMatch = pdfText.match(/Theater Name:\s*(.+?)(?:\n|$)/i)
      const pincodeMatch = pdfText.match(/Pincode:\s*(\d{6})/i)
      const cityMatch = pdfText.match(/City:\s*(.+?)(?:\n|$)/i)
      const stateMatch = pdfText.match(/State:\s*(.+?)(?:\n|$)/i)
      const addressMatch = pdfText.match(/Address:\s*(.+?)(?:\n|$)/i)
      const seatsMatch = pdfText.match(/Total Seats:\s*(\d+)/i)
      const screensMatch = pdfText.match(/Number of Screens:\s*(\d+)/i)
      const ownerNameMatch = pdfText.match(/Full Name:\s*(.+?)(?:\n|$)/i)
      const ownerEmailMatch = pdfText.match(/Email:\s*(.+?)(?:\n|$)/i)
      const ownerPhoneMatch = pdfText.match(/Phone:\s*(.+?)(?:\n|$)/i)

      // Validate required fields
      if (!theaterNameMatch || !pincodeMatch || !cityMatch || !stateMatch) {
        console.warn('⚠️ Missing required theater data in PDF')
        return null
      }

      const theaterData: TheaterLocationData = {
        theaterName: theaterNameMatch[1].trim(),
        pincode: pincodeMatch[1].trim(),
        city: cityMatch[1].trim(),
        state: stateMatch[1].trim(),
        address: addressMatch ? addressMatch[1].trim() : '',
        totalSeats: seatsMatch ? parseInt(seatsMatch[1]) : 0,
        numberOfScreens: screensMatch ? parseInt(screensMatch[1]) : 1,
        ownerName: ownerNameMatch ? ownerNameMatch[1].trim() : '',
        ownerEmail: ownerEmailMatch ? ownerEmailMatch[1].trim() : '',
        ownerPhone: ownerPhoneMatch ? ownerPhoneMatch[1].trim() : ''
      }

      console.log('✅ Successfully extracted theater data:', {
        name: theaterData.theaterName,
        pincode: theaterData.pincode,
        city: theaterData.city
      })

      return theaterData
    } catch (error) {
      console.error('❌ Error parsing PDF text:', error)
      return null
    }
  }

  /**
   * Fetch PDF content from IPFS and extract theater data
   */
  static async extractTheaterDataFromIPFS(ipfsHash: string): Promise<TheaterLocationData | null> {
    try {
      console.log('📄 Fetching PDF from IPFS:', ipfsHash)
      
      // Try multiple IPFS gateways for reliability
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
      ]

      for (const gateway of gateways) {
        try {
          console.log('🔗 Trying gateway:', gateway)
          
          // Fetch PDF content as binary buffer
          const response = await axios.get(gateway, {
            timeout: 15000,
            responseType: 'arraybuffer'
          })

          if (response.data) {
            console.log('📄 PDF downloaded, size:', response.data.byteLength, 'bytes')
            
            try {
              // For now, skip PDF parsing due to library issues
              // TODO: Implement proper PDF parsing later
              console.log('⚠️ PDF parsing temporarily disabled, using fallback data')
              
              // Fallback: try to parse as text if it's a text-based PDF
              try {
                const textContent = Buffer.from(response.data).toString('utf8')
                const theaterData = this.extractTheaterDataFromPDFText(textContent)
                if (theaterData) {
                  console.log('✅ Theater data extracted from text fallback')
                  return theaterData
                }
              } catch (textError) {
                console.warn('⚠️ Text fallback also failed:', textError)
              }
              
            } catch (pdfParseError) {
              console.warn('⚠️ PDF parsing failed:', pdfParseError)
            }
          }
          
        } catch (gatewayError) {
          console.warn(`⚠️ Gateway ${gateway} failed:`, gatewayError)
          continue
        }
      }

      console.error('❌ All IPFS gateways failed or PDF parsing unsuccessful')
      return null

    } catch (error) {
      console.error('❌ Error fetching PDF from IPFS:', error)
      return null
    }
  }

  /**
   * Check if a pincode is within a reasonable distance of another pincode
   * This is a simple implementation - in production, you'd use proper geolocation APIs
   */
  static isPincodeNearby(userPincode: string, theaterPincode: string, maxDistance: number = 50): boolean {
    try {
      // Simple proximity check based on pincode similarity
      // First 3 digits of Indian pincodes represent the sorting district
      const userDistrict = userPincode.substring(0, 3)
      const theaterDistrict = theaterPincode.substring(0, 3)
      
      // If same district, consider it nearby
      if (userDistrict === theaterDistrict) {
        return true
      }

      // Check if pincodes are numerically close (rough distance estimation)
      const userCode = parseInt(userPincode)
      const theaterCode = parseInt(theaterPincode)
      const difference = Math.abs(userCode - theaterCode)
      
      // If difference is less than 1000, consider it nearby
      return difference < 1000

    } catch (error) {
      console.error('❌ Error checking pincode proximity:', error)
      return false
    }
  }

  /**
   * Get pincode from city name using a comprehensive mapping
   * In production, you'd use a proper geocoding service
   */
  static getPincodeFromCity(cityName: string): string | null {
    const cityPincodeMap: { [key: string]: string } = {
      // Major Metro Cities
      'mumbai': '400001',
      'delhi': '110001',
      'bangalore': '560001',
      'bengaluru': '560001',
      'hyderabad': '500001',
      'chennai': '600001',
      'kolkata': '700001',
      'pune': '411001',
      'ahmedabad': '380001',
      
      // Tier 1 Cities
      'jaipur': '302001',
      'surat': '395001',
      'lucknow': '226001',
      'kanpur': '208001',
      'nagpur': '440001',
      'indore': '452001',
      'thane': '400601',
      'bhopal': '462001',
      'visakhapatnam': '530001',
      'patna': '800001',
      'vadodara': '390001',
      'ghaziabad': '201001',
      'ludhiana': '141001',
      'agra': '282001',
      'nashik': '422001',
      'faridabad': '121001',
      'meerut': '250001',
      'rajkot': '360001',
      'varanasi': '221001',
      'srinagar': '190001',
      'aurangabad': '431001',
      'dhanbad': '826001',
      'amritsar': '143001',
      'allahabad': '211001',
      'prayagraj': '211001',
      'ranchi': '834001',
      'howrah': '711101',
      'coimbatore': '641001',
      'jabalpur': '482001',
      'gwalior': '474001',
      'vijayawada': '520001',
      'jodhpur': '342001',
      'madurai': '625001',
      'raipur': '492001',
      'kota': '324001',
      'chandigarh': '160001',
      'guwahati': '781001',
      'solapur': '413001',
      'bareilly': '243001',
      'tirupati': '517501',
      
      // Additional Tier 2 Cities
      'mysore': '570001',
      'mysuru': '570001',
      'salem': '636001',
      'madura': '625001',
      'tiruchirappalli': '620001',
      'trichy': '620001',
      'erode': '638001',
      'vellore': '632001',
      'thoothukudi': '628001',
      'tirunelveli': '627001',
      'kochi': '682001',
      'kozhikode': '673001',
      'thrissur': '680001',
      'kollam': '691001',
      'thiruvananthapuram': '695001',
      'trivandrum': '695001',
      'mangalore': '575001',
      'hubli': '580001',
      'belgaum': '590001',
      'gulbarga': '585101',
      'davangere': '577001',
      'bellary': '583101',
      'bijapur': '586101',
      'shimoga': '577201',
      'tumkur': '572101',
      'raichur': '584101',
      'bidar': '585401',
      'hospet': '583201',
      'gadag': '582101',
      'robertson pet': '563122',
      'bhadravati': '577301',
      'chitradurga': '577501',
      'udupi': '576101',
      'karwar': '581301',
      'ranebennuru': '581115',
      'gangavati': '583227',
      'bagalkot': '587101',
      'port blair': '744101',
      
      // Telangana Cities (since user is in Hyderabad)
      'warangal': '506002',
      'nizamabad': '503001',
      'karimnagar': '505001',
      'ramagundam': '505209',
      'khammam': '507001',
      'mahbubnagar': '509001',
      'nalgonda': '508001',
      'adilabad': '504001',
      'suryapet': '508213',
      'miryalaguda': '508207',
      'jagtial': '505327',
      'mancherial': '504208',
      'nirmal': '504106',
      'kothagudem': '507101',
      'bodhan': '503185',
      'tandur': '501141',
      'siddipet': '502103',
      'wanaparthy': '509103',
      'palwancha': '507115',
      'bhongir': '508116',
      'secunderabad': '500003',
      'kompally': '500014',
      'kukatpally': '500072',
      'madhapur': '500081',
      'gachibowli': '500032',
      'hitec city': '500081',
      'banjara hills': '500034',
      'jubilee hills': '500033',
      'begumpet': '500016',
      'somajiguda': '500082',
      'ameerpet': '500016',
      'sr nagar': '500038',
      'punjagutta': '500082',
      'lakdikapul': '500004',
      'abids': '500001',
      'koti': '500095',
      'sultan bazar': '500095',
      'charminar': '500002',
      'falaknuma': '500053',
      'malakpet': '500036',
      'dilsukhnagar': '500060',
      'lb nagar': '500074',
      'vanasthalipuram': '500070',
      'uppal': '500039',
      'nagole': '500068',
      'tarnaka': '500017',
      'habsiguda': '500007',
      'malkajgiri': '500047',
      'alwal': '500015',
      'bollaram': '502325',
      'quthbullapur': '500055',
      'medchal': '501401',
      'shamirpet': '500078',
      'ghatkesar': '501301',
      'keesara': '501301',
      'ibrahimpatnam': '501506',
      'hayathnagar': '501505',
      'badangpet': '500058',
      'rajendranagar': '500030',
      'shamshabad': '501218',
      'chevella': '501503'
    }

    const normalizedCity = cityName.toLowerCase().trim()
    
    // Try exact match first
    let pincode = cityPincodeMap[normalizedCity]
    
    // If no exact match, try partial matching for compound city names
    if (!pincode) {
      for (const [city, code] of Object.entries(cityPincodeMap)) {
        if (normalizedCity.includes(city) || city.includes(normalizedCity)) {
          pincode = code
          break
        }
      }
    }
    
    return pincode || null
  }
}