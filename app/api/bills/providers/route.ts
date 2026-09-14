import { NextResponse } from 'next/server';

export const runtime = 'edge';

const PROVIDERS_DIRECTORY: Record<string, Record<string, string[]>> = {
    'usa': {
        'UTILITIES': ['Pacific Gas & Electric', 'Con Edison', 'Duke Energy', 'National Grid'],
        'INTERNET': ['AT&T Fiber', 'Comcast Xfinity', 'Verizon Fios', 'Spectrum'],
        'MOBILE': ['Verizon Wireless', 'T-Mobile', 'AT&T', 'Boost Mobile'],
        'CREDIT': ['Chase Card Services', 'Amex', 'Citi Cards', 'Discover'],
        'INSURANCE': ['State Farm', 'Geico', 'Progressive']
    },
    'canada': {
        'UTILITIES': ['Hydro One', 'BC Hydro', 'Enbridge Gas'],
        'INTERNET': ['Rogers Ignite', 'Bell Fibe', 'Telus PureFibre'],
        'MOBILE': ['Rogers', 'Bell Mobility', 'Telus', 'Freedom Mobile'],
        'CREDIT': ['RBC Visa', 'TD Visa', 'Scotiabank Amex'],
        'INSURANCE': ['Intact', 'Aviva Canada']
    },
    'uk': {
        'UTILITIES': ['British Gas', 'EDF Energy', 'Scottish Power', 'Thames Water'],
        'INTERNET': ['BT Broadband', 'Virgin Media', 'Sky Broadband', 'TalkTalk'],
        'TV': ['Sky TV', 'Virgin Media TV'],
        'MOBILE': ['EE', 'Vodafone UK', 'O2', 'Three'],
        'COUNCIL': ['London Borough of Camden', 'Manchester City Council']
    },
    'france': {
        'UTILITIES': ['EDF France', 'Engie', 'TotalEnergies'],
        'INTERNET': ['Orange Livebox', 'Freebox', 'SFR Box'],
        'MOBILE': ['Orange', 'SFR', 'Bouygues', 'Free Mobile'],
        'INSURANCE': ['AXA France', 'Allianz']
    },
    'germany': {
        'UTILITIES': ['E.ON', 'Vattenfall', 'RWE'],
        'INTERNET': ['Deutsche Telekom', 'Vodafone Kabel', 'O2 DSL'],
        'MOBILE': ['Telekom', 'Vodafone', 'O2 DE'],
        'INSURANCE': ['Allianz', 'HUK-Coburg']
    },
    'italy': {
        'UTILITIES': ['Enel Energia', 'A2A', 'Hera Comm'],
        'INTERNET': ['TIM', 'Vodafone Italia', 'Fastweb'],
        'MOBILE': ['TIM', 'Vodafone', 'WindTre', 'Iliad']
    },
    'spain': {
        'UTILITIES': ['Iberdrola', 'Endesa', 'Naturgy'],
        'INTERNET': ['Movistar', 'Vodafone España', 'Orange'],
        'MOBILE': ['Movistar', 'Vodafone', 'Orange', 'Yoigo']
    },
    'switzerland': {
        'UTILITIES': ['BKW', 'EWZ'],
        'INTERNET': ['Swisscom', 'Sunrise', 'Salt'],
        'MOBILE': ['Swisscom', 'Sunrise', 'Salt']
    },
    'belgium': {
        'UTILITIES': ['Engie Electrabel', 'Luminus'],
        'INTERNET': ['Proximus', 'Telenet', 'VOO'],
        'MOBILE': ['Proximus', 'Orange Belgium', 'Base']
    },
    'central-europe': {
        'UTILITIES': ['ČEZ Group', 'MVM', 'PGE'],
        'INTERNET': ['Orange Poland', 'UPC', 'T-Mobile'],
        'MOBILE': ['T-Mobile', 'Orange', 'O2', 'Vodafone']
    },
    'east-asia': {
        'UTILITIES': ['TEPCO (JP)', 'KEPCO (KR)', 'State Grid (CN)'],
        'MOBILE': ['NTT Docomo', 'SK Telecom', 'China Mobile', 'SoftBank'],
        'INTERNET': ['NTT East', 'KT Corporation', 'China Telecom']
    },
    'west-africa': {
        'UTILITIES': ['Eko Electricity (NG)', 'Ikeja Electric (NG)', 'ECG (GH)', 'Senelec (SN)'],
        'INTERNET': ['MTN Nigeria', 'Spectranet', 'Vodafone Ghana', 'Orange Senegal'],
        'TV': ['DSTV Africa', 'GOtv', 'StarTimes'],
        'MOBILE': ['MTN', 'Airtel Africa', 'Glo', '9mobile']
    }
};

export async function GET() {
    return NextResponse.json(PROVIDERS_DIRECTORY);
}
