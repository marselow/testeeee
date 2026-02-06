
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatNumber = (num: number) => {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(1);
};

export const LUA_SCRIPT = `-- Brainrot Data Collector Simple
-- Coleta apenas informações básicas dos animais e copia JSON para área de transferência

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

-- Configurações
local SCAN_INTERVAL = 30 -- segundos entre cada scan

-- Serviços e módulos
local Packages = ReplicatedStorage:WaitForChild("Packages")
local Datas = ReplicatedStorage:WaitForChild("Datas")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Utils = ReplicatedStorage:WaitForChild("Utils")

local Synchronizer = require(Packages:WaitForChild("Synchronizer"))
local AnimalsData = require(Datas:WaitForChild("Animals"))
local RaritiesData = require(Datas:WaitForChild("Rarities"))
local AnimalsShared = require(Shared:WaitForChild("Animals"))
local NumberUtils = require(Utils:WaitForChild("NumberUtils"))

-- Dados coletados
local collectedData = {
    lastUpdate = os.date("%Y-%m-%d %H:%M:%S"),
    players = {} -- Estrutura: { [userId] = { username = "", animals = {} } }
}

-- Função para copiar texto para a área de transferência
local function copyToClipboard(text)
    if not text or text == "" then
        warn("Nenhum texto para copiar!")
        return false
    end
    
    local success = pcall(function()
        if setclipboard then
            setclipboard(text)
            return true
        end
        return false
    end)
    
    if success then
        print("✓ Dados copiados para área de transferência!")
        return true
    else
        warn("✗ Não foi possível acessar a área de transferência")
        return false
    end
end

local function scanPlot(plot)
    local success, result = pcall(function()
        local channel = Synchronizer:Get(plot.Name)
        if not channel then return nil end
        
        local owner = channel:Get("Owner")
        if not owner then return nil end
        
        local ownerName = owner.Name
        local ownerUserId = owner.UserId
        
        local animalList = channel:Get("AnimalList")
        if not animalList then return nil end
        
        local plotAnimals = {}
        
        for slot, animalData in pairs(animalList) do
            if type(animalData) == "table" then
                local animalName = animalData.Index
                local animalInfo = AnimalsData[animalName]
                if not animalInfo then continue end
                
                local rarity = animalInfo.Rarity
                local mutation = animalData.Mutation or "None"
                local traits = animalData.Traits or {}
                
                local genValue = AnimalsShared:GetGeneration(animalName, animalData.Mutation, animalData.Traits, nil)
                
                local animalEntry = {
                    name = animalInfo.DisplayName or animalName,
                    baseName = animalName,
                    rarity = rarity,
                    generation = genValue,
                    mutation = mutation,
                    traits = traits,
                    slot = tostring(slot),
                    plot = plot.Name,
                    scannedAt = os.date("%H:%M:%S")
                }
                
                table.insert(plotAnimals, animalEntry)
            end
        end
        
        return {
            ownerUserId = ownerUserId,
            ownerName = ownerName,
            plotName = plot.Name,
            animals = plotAnimals
        }
    end)
    
    if success and result then
        return result
    end
    return nil
end

local function scanAllPlots()
    local plots = workspace:FindFirstChild("Plots")
    if not plots then return false end
    
    collectedData.players = {}
    collectedData.lastUpdate = os.date("%Y-%m-%d %H:%M:%S")
    
    for _, plot in ipairs(plots:GetChildren()) do
        local plotData = scanPlot(plot)
        if plotData then
            local userIdStr = tostring(plotData.ownerUserId)
            if not collectedData.players[userIdStr] then
                collectedData.players[userIdStr] = {
                    username = plotData.ownerName,
                    userId = plotData.ownerUserId,
                    animals = {}
                }
            end
            for _, animal in ipairs(plotData.animals) do
                table.insert(collectedData.players[userIdStr].animals, animal)
            end
        end
        task.wait(0.03)
    end
    return true
end

local function copyFormattedJSON()
    local formattedData = {
        lastUpdate = collectedData.lastUpdate,
        players = {}
    }
    for userId, playerData in pairs(collectedData.players) do
        table.insert(formattedData.players, {
            userId = playerData.userId,
            username = playerData.username,
            animals = playerData.animals
        })
    end
    local success, jsonData = pcall(function()
        return HttpService:JSONEncode(formattedData)
    end)
    if success then
        copyToClipboard(jsonData)
        return true
    end
    return false
end

local function init()
    if not game:IsLoaded() then game.Loaded:Wait() end
    task.wait(2)
    while true do
        if scanAllPlots() then
            copyFormattedJSON()
        end
        task.wait(SCAN_INTERVAL)
    end
end

init()`;
