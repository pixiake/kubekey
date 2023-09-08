package main

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/gin-gonic/gin"
	"github.com/kubesphere/kubekey/v3/cmd/kk/pkg/common"
	"github.com/kubesphere/kubekey/v3/cmd/kk/pkg/core/logger"
	"github.com/kubesphere/kubekey/v3/cmd/kk/pkg/pipelines"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/user"
	"path/filepath"
	"time"
)

var csrToken = "a123456b"

func main() {
	router := gin.Default()

	// Serve frontend static files
	//router.Static("/react", "./react")

	// Create API group
	api := router.Group("/api/v1alpha1")
	api.POST("/clusters", CreateCluster)
	api.GET("/csrftoken/login", GetLoginCsrToken)
	api.GET("/csrftoken/deploy", GetLoginCsrToken)
	api.POST("/login", Login)
	api.GET("/cluster", GetCluster)

	// Check token for login
	router.POST("/login", func(c *gin.Context) {
		token := c.PostForm("token")
		originalToken, _ := ioutil.ReadFile("token.txt")

		if token == string(originalToken) {
			c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		}
	})

	go router.Run(":8080")

	usr, _ := user.Current()
	watchDir := filepath.Join(usr.HomeDir, ".kubekey/clusters")

	if _, err := os.Stat(watchDir); os.IsNotExist(err) {
		err = os.MkdirAll(watchDir, 0700)
		if err != nil {
			log.Fatal(err)
		}
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	done := make(chan bool)
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				log.Println("event:", event)
				if event.Op&fsnotify.Create == fsnotify.Create {
					time.Sleep(1 * time.Second)
					arg := common.Argument{
						FilePath: filepath.Join(event.Name, "cluster.yaml"),
					}
					go func() {
						err := pipelines.CreateCluster(arg, "curl -L -o %s %s")
						if err != nil {
							logger.Log.Error(err)
						}
					}()
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("error:", err)
			}
		}
	}()

	err = watcher.Add(watchDir)
	if err != nil {
		log.Fatal(err)
	}
	<-done
}

func CreateCluster(c *gin.Context) {
	var jsonConfig map[string]interface{}
	if err := c.ShouldBindJSON(&jsonConfig); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(jsonConfig)
	var data map[string]interface{}
	err := yaml.Unmarshal([]byte(jsonConfig["content"].(string)), &data)
	if err != nil {
		fmt.Println("JSON unmarshal error:", err)
		return
	}

	yamlConfig, err := yaml.Marshal(data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
	}

	usr, _ := user.Current()
	dir := filepath.Join(usr.HomeDir, ".kubekey/clusters", jsonConfig["name"].(string))

	if err := os.MkdirAll(dir, 0750); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
		return
	}

	configPath := fmt.Sprintf("%s/cluster.yaml", dir)
	err = ioutil.WriteFile(configPath, yamlConfig, 0644)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write file"})
		return
	}

	// Create cluster

	c.JSON(http.StatusOK, gin.H{"status": "Config file generated successfully"})
}

func GetLoginCsrToken(c *gin.Context) {
	csrToken = generateCsrToken()
	data := map[string]string{
		"token": csrToken,
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// Function to generate a csrToken
func generateCsrToken() string {
	// Generate a random csrToken and set its expiration time
	// This is a placeholder, replace with your own implementation
	return "a123456b"
}

func Login(c *gin.Context) {
	var jsonConfig map[string]interface{}

	if err := c.ShouldBindJSON(&jsonConfig); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	receivedCsrToken := c.GetHeader("X-CSRF-TOKEN")
	fmt.Println("test", jsonConfig["token"], receivedCsrToken)

	// Check if the csrToken is valid and not expired
	if !isValidCsrToken(receivedCsrToken, csrToken) {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized, invalid csrToken"})
		return
	}

	data := map[string]string{
		"jweToken": csrToken,
		"name":     "admin",
	}
	// Check if the login token is correct
	//originalToken, _ := ioutil.ReadFile("token.txt")

	if jsonConfig["token"] == "admin" {
		c.JSON(http.StatusOK, gin.H{"data": data})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized, invalid token"})
	}
}

// Function to check if a csrToken is valid and not expired
func isValidCsrToken(receivedCsrToken string, csrToken string) bool {
	// Check if the received csrToken matches the current csrToken and is not expired
	// This is a placeholder, replace with your own implementation
	return receivedCsrToken == csrToken
}

func GetCluster(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []string{}})
}
