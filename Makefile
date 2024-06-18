zipname = chrome-reloader.zip
clean:
	rm -rf *~
	rm -f ./${zipname}

${zipname}: ./src/*
	cd ./src; zip ../${zipname} *

build: ${zipname}
