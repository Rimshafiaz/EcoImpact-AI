WORLD_BANK_REGIONS = {
    'Europe & Central Asia': [
        'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium',
        'Bosnia and Herzegovina', 'Bulgaria', 'Channel Islands', 'Croatia', 'Cyprus',
        'Czech Republic', 'Czechia', 'Denmark', 'Estonia', 'Faroe Islands', 'Finland',
        'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece', 'Greenland', 'Hungary',
        'Iceland', 'Ireland', 'Isle of Man', 'Italy', 'Kazakhstan', 'Kosovo', 'Kyrgyzstan',
        'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova',
        'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland',
        'Portugal', 'Romania', 'Russia', 'Russian Federation', 'San Marino', 'Serbia',
        'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Tajikistan', 'Turkey',
        'Turkmenistan', 'Ukraine', 'United Kingdom', 'Uzbekistan', 'EU', 'EU27', 'EU27+'
    ],

    'North America': [
        'United States', 'Canada', 'Bermuda'
    ],

    'East Asia & Pacific': [
        'American Samoa', 'Australia', 'Brunei', 'Brunei Darussalam', 'Cambodia', 'China',
        'Cook Islands', 'Fiji', 'French Polynesia', 'Guam', 'Hong Kong', 'Indonesia',
        'Japan', 'Kiribati', 'Laos', 'Macao', 'Malaysia', 'Marshall Islands', 'Micronesia',
        'Mongolia', 'Myanmar', 'Nauru', 'New Caledonia', 'New Zealand', 'Niue',
        'North Korea', 'Northern Mariana Islands', 'Palau', 'Papua New Guinea',
        'Philippines', 'Samoa', 'Singapore', 'Solomon Islands', 'South Korea',
        'Taiwan', 'Thailand', 'Timor-Leste', 'Tonga', 'Tuvalu', 'Vanuatu', 'Vietnam',
        'Pakistan', 'India', 'Bangladesh', 'Afghanistan', 'Sri Lanka', 'Nepal',
        'Bhutan', 'Maldives'
    ],

    'Latin America & Caribbean': [
        'Antigua and Barbuda', 'Argentina', 'Aruba', 'Bahamas', 'Barbados', 'Belize',
        'Bolivia', 'Brazil', 'British Virgin Islands', 'Cayman Islands', 'Chile',
        'Colombia', 'Costa Rica', 'Cuba', 'Curacao', 'Dominica', 'Dominican Republic',
        'Ecuador', 'El Salvador', 'Grenada', 'Guatemala', 'Guyana', 'Haiti', 'Honduras',
        'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Puerto Rico',
        'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Martin', 'Saint Vincent and the Grenadines',
        'Sint Maarten', 'Suriname', 'Trinidad and Tobago', 'Turks and Caicos Islands',
        'Uruguay', 'Venezuela', 'Virgin Islands'
    ],

    'Middle East & North Africa': [
        'Algeria', 'Bahrain', 'Djibouti', 'Egypt', 'Iran', 'Iraq', 'Israel', 'Jordan',
        'Kuwait', 'Lebanon', 'Libya', 'Morocco', 'Oman', 'Palestine', 'Qatar',
        'Saudi Arabia', 'Syria', 'Tunisia', 'United Arab Emirates', 'West Bank and Gaza',
        'Yemen'
    ],

    'Sub-Saharan Africa': [
        'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde',
        'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
        'Congo', 'Democratic Republic of Congo', 'Equatorial Guinea', 'Eritrea',
        'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau',
        'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Madagascar', 'Malawi', 'Mali',
        'Mauritania', 'Mauritius', 'Mayotte', 'Mozambique', 'Namibia', 'Niger',
        'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles',
        'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania',
        'Togo', 'Uganda', 'Zambia', 'Zimbabwe'
    ]
}

INCOME_LEVELS = {
    'High income': [
        'Andorra', 'Antigua and Barbuda', 'Aruba', 'Australia', 'Austria', 'Bahamas',
        'Bahrain', 'Barbados', 'Belgium', 'Bermuda', 'British Virgin Islands', 'Brunei',
        'Canada', 'Cayman Islands', 'Channel Islands', 'Chile', 'Croatia', 'Curacao',
        'Cyprus', 'Czech Republic', 'Czechia', 'Denmark', 'Estonia', 'Faroe Islands',
        'Finland', 'France', 'French Polynesia', 'Germany', 'Gibraltar', 'Greece',
        'Greenland', 'Guam', 'Hong Kong', 'Hungary', 'Iceland', 'Ireland', 'Isle of Man',
        'Israel', 'Italy', 'Japan', 'South Korea', 'Kuwait', 'Latvia', 'Liechtenstein',
        'Lithuania', 'Luxembourg', 'Macao', 'Malta', 'Monaco', 'Nauru', 'Netherlands',
        'New Caledonia', 'New Zealand', 'Northern Mariana Islands', 'Norway', 'Oman',
        'Palau', 'Panama', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Romania',
        'San Marino', 'Saudi Arabia', 'Seychelles', 'Singapore', 'Sint Maarten',
        'Slovakia', 'Slovenia', 'Spain', 'Saint Kitts and Nevis', 'Saint Martin',
        'Sweden', 'Switzerland', 'Taiwan', 'Trinidad and Tobago', 'Turks and Caicos Islands',
        'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
        'Virgin Islands'
    ]
}

def get_region(country):
    for region, countries in WORLD_BANK_REGIONS.items():
        if country in countries:
            return region
    return 'East Asia & Pacific'

def get_income_level(country):
    if country in INCOME_LEVELS['High income']:
        return 'High income'
    return 'Upper middle income'
