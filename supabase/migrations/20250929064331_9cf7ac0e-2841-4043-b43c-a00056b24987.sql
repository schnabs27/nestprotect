-- Rename columns in zips_with_risks table to lowercase for easier handling
ALTER TABLE public.zips_with_risks 
  RENAME COLUMN "ZIPCODE" TO zipcode;

ALTER TABLE public.zips_with_risks 
  RENAME COLUMN "RISK_RATNG" TO risk_rating;

ALTER TABLE public.zips_with_risks 
  RENAME COLUMN "HIGH_RISKS" TO high_risks;

ALTER TABLE public.zips_with_risks 
  RENAME COLUMN "USPS_ZIP_PREF_CITY" TO city;

ALTER TABLE public.zips_with_risks 
  RENAME COLUMN "USPS_ZIP_PREF_STATE" TO state;

-- Rename other commonly used columns
ALTER TABLE public.zips_with_risks 
  RENAME COLUMN "COUNTY" TO county;

ALTER TABLE public.zips_with_risks 
  RENAME COLUMN "COUNT_HIGH_RISKS" TO count_high_risks;