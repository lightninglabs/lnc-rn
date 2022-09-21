require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "lnc-mobile"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "11.1" }
  s.source       = { :git => "https://github.com/lightninglabs/lnc-rn.git", :tag => "#{s.version}" }
  s.swift_version = '5.0'

  s.source_files = "ios/*.{h,m,mm,swift}"
  s.ios.vendored_frameworks= "ios/Lncmobile.xcframework"
  s.dependency "React"
end
