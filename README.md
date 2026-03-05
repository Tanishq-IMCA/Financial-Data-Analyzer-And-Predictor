# PMAF: Predictive Modelling and Forecasting Tool

## Project Overview
This web application is designed for the **PMAF (Predictive Modelling and Forecasting)** subject, specifically focusing on intaking CSV data to predict **Purchase Probability** and **Future Spending**.

The tool provides a streamlined, professional interface for data scientists and analysts to upload raw datasets, perform essential data cleaning, and prepare high-quality inputs for predictive models.

## Key Features
- **CSV Data Intake**: Seamlessly upload CSV files for analysis.
- **Data Validation**: Automatically detects the number of rows and identifies potential issues.
- **Intelligent Cleaning**: 
    - Remove empty spaces and null values.
    - Handle invalid data formats.
    - Real-time progress tracking with a visual progress bar.
- **Glassmorphic UI**: A modern, "glassy" user interface built with advanced CSS techniques for a professional aesthetic, featuring a high-quality atmospheric background.
- **Instant Export**: Download your cleaned dataset immediately after processing is complete.

## Workflow
1. **Upload**: Drop your `.csv` file into the upload zone.
2. **Review**: See the total row count and data summary.
3. **Clean**: Select cleaning options (e.g., "Trim Whitespace", "Remove Empty Rows") and initiate the process.
4. **Monitor**: Watch the progress bar as the data is transformed.
5. **Download**: Grab your refined CSV file, ready for forecasting models.

## Technical Architecture
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS with Glassmorphism (backdrop-filter)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **CSV Parsing**: PapaParse

---
*Status: Initial documentation and UI structure complete. Awaiting user confirmation to proceed with advanced forecasting logic.*
