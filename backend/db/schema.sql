-- Database: AntiProcrastinationApp

-- DROP DATABASE IF EXISTS "AntiProcrastinationApp";

CREATE DATABASE "AntiProcrastinationApp"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;




CREATE TABLE "User"(
    User_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Username VARCHAR(255) NOT NULL UNIQUE,
    Password_hash VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User_profile (
    User_id BIGINT PRIMARY KEY,
    Display_name VARCHAR(255),
    Bio TEXT, 
    Avatar_url TEXT,
    Banner_url TEXT,
    Pronouns VARCHAR(50),

    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_USER
        FOREIGN KEY(User_id)
        REFERENCES "User"(User_id)
        ON DELETE CASCADE
);

CREATE TABLE Connection (
    User_id BIGINT,
    Friend_id BIGINT,
    Status VARCHAR(50) NOT NULL, 
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Accepted_at TIMESTAMP,
    Initiated_by BIGINT,

 
    CONSTRAINT PK_Connection PRIMARY KEY (User_id, Friend_id),


    CONSTRAINT FK_Connection_User
        FOREIGN KEY (User_id)
        REFERENCES "User"(User_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Connection_Friend
        FOREIGN KEY (Friend_id)
        REFERENCES "User"(User_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Connection_Initiated
        FOREIGN KEY (Initiated_by)
        REFERENCES "User"(User_id)
        ON DELETE CASCADE,

    CONSTRAINT CHK_Order CHECK (User_id < Friend_id),
    CONSTRAINT CHK_No_Self CHECK (User_id <> Friend_id),
    CONSTRAINT CHK_Status CHECK (Status IN ('pending', 'accepted', 'blocked'))

);



CREATE TABLE Assignment(
    Assignment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    User_id BIGINT NOT NULL,  

    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Due_date TIMESTAMP NOT NULL,
    Priority VARCHAR(50) NOT NULL,
    Status VARCHAR(50) NOT NULL,

    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT FK_Assignment_User
        FOREIGN KEY (User_id)
        REFERENCES "User"(User_id)
        ON DELETE CASCADE,

    CONSTRAINT CHK_Priority CHECK (Priority IN ('low', 'medium', 'high')),
    CONSTRAINT CHK_Status CHECK (Status IN ('pending', 'in_progress', 'completed'))
);